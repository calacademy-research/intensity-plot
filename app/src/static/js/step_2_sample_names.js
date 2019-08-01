"use strict";

// TODO: Bug - browsing directories on tdobz throws all kinds of errors.
// TODO: Bug - setting directory and going to stage two pops up both a "prereq missing!" and "sample set already exists".
// TODO: Disable "next" button when prerequesies aren't met
// TODO: Check that saving options works, with breakpoint, incomplete code is stored in said project root
function Step2() {
    var fastqFiles;  // all the fastq files
    var userRequestedCancel, userRequestedPause, timeoutVal=0;
    var appendDetailStr;

    function setup() {
        createTooltips();
    }

    function removeFullSample() {
        $.ajax({
            type: "GET",
            url: '/remove_full_sample',
            data: {
                "directory": mu.projectDirectory
            },
            dataType: "text",
            error: handleAjaxError,

            async: false
        });
    }

    // check for FullSampleRun_R1.fq and FullSampleRun_R2.fq
    function checkForExistingSamples() {
        var directoryListing = getDirectoryListing();
        for (var i = 0; i < directoryListing.length; i++) {
            // TODO: hardcoded; see options
            if(directoryListing[i][0].startsWith("FullSampleRun") &&
                !directoryListing[i][0].includes("_trim")) {
                return directoryListing[i];
            }
        }
        return false;

    }
    this.checkForExistingSamples = checkForExistingSamples;

    var samplesExist; // used to determine which glyph to show in Appended column
    function updateExistingSamplesDisplay(fullRunJustCompleted) {
        $("#step_2_samples_exist").addClass('hidden');
        $("#step_2_fullrun_create_success").addClass('hidden');

        samplesExist = checkForExistingSamples();
        if (samplesExist !== false) {
            if (fullRunJustCompleted === true)
                $("#step_2_fullrun_create_success").removeClass('hidden');
            else
                $("#step_2_samples_exist").removeClass('hidden');
        }
        //TODO: grey out any action buttons.
        setButtonStates();
    }

    function removeExistingSamples(confirm) {
        confirm = (confirm===false) ? false : true; // true or undefined returns true
        if (confirm && ! confirmFileRemoval()) return;

        removeFullSample();
        initFullSampleSetInfo(); // so we don't rely on partially built-out data structure
        var $progress_icons = $(".step2_progress_icon");
        $progress_icons.html("").removeClass("glyphicon-ok").removeClass("textgreen").addClass("glyphicon-remove");
        updateExistingSamplesDisplay();
    }
    this.removeExistingSamples = removeExistingSamples;

    this.onSetSampleNamesFromFilename = function() {
        var delimDefault = "_", $step2_delimstr = $("#step2_delimstr");
        var delimVal = $step2_delimstr.val().trim();
        if (delimVal === "") { // reset to default and uncheck regex
            delimVal = delimDefault;
            $step2_delimstr.prop('checked', false);
        }

        $step2_delimstr.val(delimVal); // might have changed via trim() or reset to default

        var isRegEx = $("#step2_delimstr_regex").prop("checked");
        setSampleNamesFromFilename(delimVal, isRegEx);
    };

    this.onSetPopNamesFromFile = function() {
        var delimDefault = "_", $population_delimstr = $("#population_delimstr");
        var delimVal = $population_delimstr.val().trim();
        if (delimVal === "") { // reset to default and uncheck regex
            delimVal = delimDefault;
            $population_delimstr.prop('checked', false);
        }

        $population_delimstr.val(delimVal); // might have changed via trim() or reset to default

        var isRegEx = $("#population_delimstr_regex").prop("checked");
        var removeTrailingDigits = $("#population_trailing_digits").prop("checked");
        setPopNamesFromFile(delimVal, isRegEx, removeTrailingDigits);
    };

    this.sortTable = function() {
        setFilesFromDisplay(); // update Sample Name info from what user has put on the screen
        var origRecs = mu.fullSampleSetInfo.totalRecords;
        mu.fullSampleSetInfo.totalRecords = (origRecs > 0) ? origRecs : 1; // >1 to show table from data struct

        mu.fullSampleSetInfo.aSampleInfo.sort( sortFunction );
        displayTable();

        mu.fullSampleSetInfo.totalRecords = origRecs;
        muSaveData();

        function sortFunction(oSampleA, oSampleB) {
            var aPop = oSampleA.population, bPop = oSampleB.population;
            if (aPop === bPop) return naturalSort(oSampleA.name, oSampleB.name);
            return naturalSort(aPop, bPop);
        }
    };

    function show() {
        var maxStep = mu.flow.getServerSideStep();
        if (maxStep < 2) {
            $("#step_2_prerequsites").removeClass('hidden');
            $("#step_2_prerequsites_directory").text(mu.projectDirectory);
        } else {
            $("#step_2_prerequsites").addClass('hidden');
        }
        $("#step_2_project_path").text(mu.projectDirectory);

        $('#step2_pause_cancel').addClass("hidden");

        // first time through we ask server for fastq file sets and guess the sample names
        // after we make the FullSampleRun files we need to show what we really used to create the files
        var firstTime = checkForExistingSamples() === false; // checkForExistingSamples() is odd, returns false or an object
        firstTime = firstTime && (!mu.fullSampleSetInfo.totalRecords || mu.fullSampleSetInfo.totalRecords < 1);
        firstTime = firstTime || (mu.fullSampleSetInfo.aSampleInfo.length === 0);

        if (maxStep >= 1) {
            fastqFiles = getFastqFileListing();

            if (!firstTime) { // load fastqFiles name, R1_filename and R2_filename from mu.fullSampleSetInfo
                fastqFiles = {};
                $.each(mu.fullSampleSetInfo.aSampleInfo, function (ix, oSamp) {
                    var nm = oSamp.name;
                    fastqFiles[nm] = {};
                    fastqFiles[nm].name = oSamp.name;
                    fastqFiles[nm].R1_filename = oSamp.R1;
                    fastqFiles[nm].R2_filename = oSamp.R2;
                });
            }
        }

        updateExistingSamplesDisplay();
        displayTable(firstTime);
    }

    function displayTable(firstTime) {
        var numSamples = 0;
        var $sample_set_table = $("#fastq_files");
        var glyph = (samplesExist) ? 'glyphicon glyphicon-ok textgreen' : 'glyphicon glyphicon-remove';
        $sample_set_table.empty(); // otherwise we create a new set each time we visit Step 2

        if ( firstTime ) { // got server to figure things out for us
            Object.keys(fastqFiles).sort(naturalSort).forEach(function (sampleName, i) {
                // TODO: Add smarts around checking that both filenames are present
                var curSample = fastqFiles[sampleName];
                //var curSample = { name: fastqFiles[i+1][0], R1_filename: fastqFiles[i+1][1], R2_filename: fastqFiles[i+1][2] };
                var displayRow = makeRowHtml(curSample.name, curSample.R1_filename, curSample.R2_filename, i);

                $sample_set_table.append(displayRow);
                numSamples++;
            });
        }
        else {
            $.each(mu.fullSampleSetInfo.aSampleInfo, function (ix, oSamp) {
                var displayRow = makeRowHtml(oSamp.name, oSamp.R1, oSamp.R2, ix, oSamp.recordsAppended, oSamp.population);

                $sample_set_table.append(displayRow);
                numSamples++;
            });
        }

        // $("#step_2_sample_count").html("<br>" + numSamples + " paired-end read sets of files found.");

        for (var i = 0; i < fastqFiles.length; i++) {
            var fileText = fastqFiles[i].text;
            if (isFastq(fileText) && !fileText.startsWith("FullSampleRun")) {
                $sample_set_table.append("<li>" + fileText + "</li>");
            }
        }

        $('#Step2').find(".step_2_clearable").each(function () {

            this.addEventListener("input", function () {
                highlightBadSampleName(this, true);
            }, false);

        });
        setFilesFromDisplay();
        setButtonStates();

        // we get info from the fastqFiles object first time thru, but subsequently use mu.fullSampleSetInfo
        // this function lets us just pass in relevant vars we can make the html string
        function makeRowHtml(sampleName, R1_filename, R2_filename, ix, appendedRecs, populationName) {
            appendedRecs = (appendedRecs && appendedRecs > 0) ? appendedRecs : "";
            populationName = (populationName) ? populationName : "";
            var displayRow = "<tr>";
            displayRow += "<td class='step_2_clearable sample_name' id='" + sampleName + "' contenteditable='true'>" + sampleName + "</td>";
            displayRow += "<td class='R1'>" + R1_filename + "</td>";
            displayRow += "<td class='R2'>" + R2_filename + "</td>";
            displayRow += "<td class='population_name' contenteditable='true'>" + populationName + "</td>";
            displayRow += "<td class='text-center'>" +
                "<span id=status_" +
                sampleName +
                " class='"+glyph+" step2_progress_icon aria-hidden='true'> "+appendedRecs+"</span>" +
                "</td>" +
                "<td class='text-right'>"+(ix+1)+"</td>"; // show a count of the FASTQ pairs

            displayRow += "</tr>";
            return displayRow;
        }
    }

    // If the sample names aren't complete, don't enable the button.
    function setFullSampleButtonState() {
        //  Check that all the samples are present and there are no duplicate names.
    }

    function setSampleNamesFromFilename(delimStr, isRegEx) {
        var curval, R1name, nameFromFile;
        $(".step_2_clearable").each(function (index) {
            curval = $(this).text().trim();
            if (curval === "") {
                R1name = $(this).next(".R1").text();
                nameFromFile = sampleNameFromFilename(R1name, delimStr, isRegEx);
                if (nameFromFile !== "")
                    $(this).text(nameFromFile).removeClass("bg-danger other");
            }
        });

        var tuples = buildTupleArrayAll();
        clearDupeMarkup(tuples);
        checkDupes(tuples);

        setButtonStates();
    }

    function sampleNameFromFilename(filename, delimStr, isRegEx) {
        // delimStr can be either a string or a regex string if isRegEx is true (e.g. "_(S.*)_L001")
        // if not regex then look for that string in Filename and use what's to the left of it for Sample Name.
        // If regex we use what matches as Sample Name allowing up to one capture group.
        if (!filename || filename === "" || !delimStr || delimStr === "") return "";

        // discriminate btw regular string and regex
        var regStr = "", re;
        if (isRegEx) { // we'll treat it as a regex
            regStr = delimStr;
            re = new RegExp(regStr);
        }

        if (regStr === "") {
            var ix = filename.indexOf(delimStr);
            if (ix > 1)
                return filename.substr(0, ix);
        }
        else {
            var match = re.exec(filename);
            if (match && match.length > 0)
                return (match.length===1 ?  match[0] : match[1]);
        }

        return "";
    }

    function setPopNamesFromFile(delimVal, isRegEx, removeTrailingDigits) {
        // setting population name is similar to setting the Sample name
        // except that it is sometimes necessary to remove Trailing Digits
        // and clean up trailing '-' or '_' chars before the trailing digits

        var curval, R1name, nameFromFile="", nChgd = 0;
        $("td.population_name").each(function (index) {
            curval = $(this).text().trim();
            if (curval === "") {
                R1name = $(this).parent().find(".R1").text();
                nameFromFile = sampleNameFromFilename(R1name, delimVal, isRegEx);
                if (removeTrailingDigits) {
                    nameFromFile = nameFromFile.replace(/\d+$/, ""); // remove trailing digits
                    nameFromFile = nameFromFile.replace(/[\-_]$/,""); // remove trailing - or _
                }
                curval = nameFromFile;
                $(this).text(curval);
            }

            if (validSampleEntry(index)) {
                if (mu.fullSampleSetInfo.aSampleInfo[index].population !== curval)
                    nChgd++; // value changed from what's on screen
            }
        });
        if (nChgd) {
            // this lets us change Population names after the FullRun append has occurred
            // unlike the sample names which are embedded in the file these can be changed later on
            muSaveData();
        }
    }

    function updatePopName(ix, popname) {
        if (validSampleEntry(ix) && mu.fullSampleSetInfo.aSampleInfo[ix].name !== '') {
            mu.fullSampleSetInfo.aSampleInfo[ix].population = popname;
            return 1;
        }
        return 0;
    }

    //Duplicates and missing and malformed sample names
    function highlightBadSampleNames(doCheckDups) { // 27Jun2017 added doCheckDups arg

        $('#Step2').find('.sample_name').each(function (index, element) {

            highlightBadSampleName(this, doCheckDups); //false);
        });

    }


    function highlightBadSampleName(element, doCheckDupes) {
        var tuples = buildTupleArrayAll();
        clearDupeMarkup(tuples);

        var isGood = true;
        var curText = element.textContent;
        if (curText.length < 1)
            isGood = false;
        if (curText.indexOf(' ') > 0)
            isGood = false;

        if (!isGood) {
            $(element).addClass("bg-danger other");
        } else {
            $(element).removeClass("bg-danger other");
        }
        if (doCheckDupes)
            checkDupes(tuples);

        setFileFromDisplay(element);
        setButtonStates();


    }

    function checkDupes(tuples) {
        var obj = {};

        for (var i = 0; i < tuples.length; i++) {
            var lookupTuple = obj[tuples[i][1]];
            if (lookupTuple !== undefined) {
                $('#' + tuples[i][0]).addClass("duplicate").addClass("bg-danger");
                $('#' + lookupTuple).addClass("duplicate").addClass("bg-danger");
            } else {
                obj[tuples[i][1]] = tuples[i][0];
            }
        }
    }

    // A bit of a lie; omits tuples with the class "other", which
    // is used to indicate a problem with the filename.
    // returns original samplename and new user samplename.
    function buildTupleArrayAll() {
        var tuples = [];
        var $sampleNames = $('#Step2').find('.sample_name');
        $sampleNames.each(function (index, otherElement) {
            if (!otherElement.classList.contains('other')) {
                var text = otherElement.textContent;
                var id = $(otherElement).attr('id');

                var population = $(otherElement).parent().find(".population_name").text();
                var R1_filename = $(otherElement).parent().find(".R1").text();
                var R2_filename = $(otherElement).parent().find(".R2").text();

                //tuples.push([id, text, population]);
                tuples.push([id, text, population, R1_filename, R2_filename]); // store pop, R1, and R2 in tuple
            }
        });
        return tuples;
    }


    function clearDupeMarkup(duplicates) {
        for (var i = 0; i < duplicates.length; i++) {
            var curId = duplicates[i][0];
            $('#' + curId).removeClass("duplicate").removeClass("bg-danger");
        }
    }

    // Depends on the VISUAL state of things;
    // check this last. Looks at whether either of the
    // warning states are enabled and checks for "bg-danger"
    // in each sample name.
    function setButtonStates() {
        var $step2 = $('.step2');

        var nSampleNames = $('.step2 .sample_name').length; // not used, just to check in debugger
        var nInvalidSampleNames = $('.step2 .sample_name.bg-danger').length;
        var allowCreate = (nInvalidSampleNames===0); // can't create if invalid sample names

        var prereqMet = $('#step_2_prerequsites').hasClass('hidden');

        var samplesExist = ! $('#step_2_samples_exist').hasClass('hidden');
        samplesExist = samplesExist || ! $('#step_2_fullrun_create_success').hasClass('hidden'); // we might have just done it

        // our appended sample file set exists, we can go to next step; otherwise we can't
        $step2.find('.nextButton').prop('disabled', !samplesExist);
        $('#Step2 .disable_if_files').prop('disabled', samplesExist); // if samples exist don't let names be cleared

        var canClick = (allowCreate && prereqMet && !samplesExist);
        $step2.find('#create_button').prop('disabled', !canClick);

    }

    function setFilesFromDisplay() {
        $('#Step2').find('.sample_name').each(function (index, element) {
            setFileFromDisplay(index, element);
        });
    }

    // these functions act to scrape the screen and update internal variables for a single row of the table
    function setFileFromDisplay(index, element) {
        var origSampleName = $(element).attr('id');
        if (fastqFiles[origSampleName])
            fastqFiles[origSampleName]['userValue'] = element.textContent;

        updateSampleSetInfo(index, element);
    }
    function updateSampleSetInfo(index, element) {
        // update all relevant aSampleInfo values for this sample from the values on the screen
        var screenSampleName = $(element).text(), txt;
        if (screenSampleName !== "" && mu.fullSampleSetInfo && mu.fullSampleSetInfo.aSampleInfo) {

            var oSamp = initSampleSetInfoIfEmpty(index);

            oSamp.name = screenSampleName;
            oSamp.R1 = $(element).parent().find("td.R1").text();
            oSamp.R2 = $(element).parent().find("td.R2").text();
            oSamp.population = $(element).parent().find("td.population_name").text();
        }
    }
    function initSampleSetInfoIfEmpty(index) {
        if ( ! validSampleEntry(index) )
            mu.fullSampleSetInfo.aSampleInfo[index] = {ixOrig: index, recordsAppended: -1};

        return mu.fullSampleSetInfo.aSampleInfo[index];
    }
    //
    function validSampleEntry(index) {
        if (!mu.fullSampleSetInfo) mu.fullSampleSetInfo = {};
        if (!mu.fullSampleSetInfo.aSampleInfo) mu.fullSampleSetInfo.aSampleInfo = [];
        else if (mu.fullSampleSetInfo.aSampleInfo[index])
            return true;
        return false;
    }

    this.show = show;
    this.clearSampleNames = function () {
        $(".step_2_clearable").each(function (index) {
            $(this).text("");
        });
        highlightBadSampleNames();
    };

    this.clearPopulationNames = function() {
        $(".population_name").each(function (index) {
            $(this).text("");
        });
        updateExistingSamplesDisplay();
    };

    function appendCompleted() {
        mu.fullSampleSetInfo.secsToCreate = parseInt( (mu.fullSampleSetInfo.createEnded
            - mu.fullSampleSetInfo.createStarted) / 1000 ) + 1;

        updateExistingSamplesDisplay(true);

        var detailStr = mu.fullSampleSetInfo.totalRecords.toLocaleString() + " pairs of reads from "
                      + mu.fullSampleSetInfo.aSampleInfo.length + " sets of Sample Files.";

        setLogMsg(detailStr, appendDetailStr);
        $('#fullrun_create_detail').html(detailStr);

        $('html,body').animate({scrollTop: 0}, 1000);
        muSaveData();
    }

    function appendCancelled() {

        if (timeoutVal !== 0) clearTimeout(timeoutVal);

        if (confirm("Cancel Append and Delete Files?")) {
            removeExistingSamples(false); // false means it doesn't ask for confirmation as well
            updateExistingSamplesDisplay(true);
            muSaveData();
            setTimeout(function () {
                    $('html,body').scrollTop(0);
                    $('#step2_pause_cancel').addClass("hidden");
                },
                1000);
            return true;
        }
        else
            userRequestedCancel = false;

        return false;
    }

    // initialize the data structure that holds info for Step 2's outcome
    function initFullSampleSetInfo() {
        mu.fullSampleSetInfo = {R1: "FullSampleRun_R1.fq", R2: "FullSampleRun_R2.fq"}; // TODO: shouldn't hardwire
        mu.fullSampleSetInfo.totalRecords = 0;
        mu.fullSampleSetInfo.createStarted = Date.now(); // millisecs. for readable d = new Date(milli); d.toDateString()
        mu.fullSampleSetInfo.createEnded = 0;
        mu.fullSampleSetInfo.secsToCreate = 0;
        mu.fullSampleSetInfo.log = "";
        mu.fullSampleSetInfo.aSampleInfo = [];
        appendDetailStr = "";
    }
    function setLogMsg(detailStr, appendDetailStr) {
        var fnames = mu.fullSampleSetInfo.R1 + " and " + mu.fullSampleSetInfo.R2 + " created.";
        var comment = "The header of each FASTQ record has the Sample name prepended to it with @ for downstream processing. ";
        comment += "For example:\n\n@" + $(".sample_name").first().text() + "@EAS139:136:FC706VJ:2:2104:15343:197393 1:N:0:202";
        comment +=    "\nCCTCGAACTTATACTGATTTTTCAAGCTCTTGAAATATGCCTGAAAATAACCACAATCGAGCTTCAGGTTATCACTTTTTTAAGTTTACTTCAAAAATAT";
        comment += "\n+\nCCCC<BFGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGFGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG";
        comment += "\n\nOn Linux systems you can get a listing & count of the sample names in the file using this command:";
        comment += "\n    sed -n 's/^@//;s/@.*//p;n;n;n;' FullSampleRun_R1.fq | uniq -c";
        mu.fullSampleSetInfo.log = "\n" + fnames + "\n" + detailStr + "\n\n" + comment + "\n\n" + appendDetailStr;
    }

    // Calls itself as a "success" condition so it doesn't
    // launch everything in parallel.
    function appendSampleSet(curSampleSetIndex,tuples) {

        if (userRequestedCancel && appendCancelled()) {
            return;
        }
        if (userRequestedPause) {
            setTimeout( function(){ appendSampleSet(curSampleSetIndex,tuples) }, 250 );
            return; // wait 1/4 second and call this again with same arguments
        }

        var sampleFileName = tuples[curSampleSetIndex][0];
        var userSampleName = tuples[curSampleSetIndex][1];
        var populationName = tuples[curSampleSetIndex][2];
        var r1_filename    = tuples[curSampleSetIndex][3];
        var r2_filename    = tuples[curSampleSetIndex][4];

        // get all values from the tuple built from the table
        // only use fastqFiles for loading the table
        /*
        var curSample = fastqFiles[sampleFileName];
        var r1_filename = curSample.R1_filename;
        var r2_filename = curSample.R2_filename;
        */

        var cmd = "/bin/prepend_one_samp.sh?args=" + mu.projectDirectory;
        cmd = cmd + "+" + userSampleName;
        cmd = cmd + "+" + r1_filename;
        cmd = cmd + "+" + r2_filename;
        if (curSampleSetIndex === 0)
            cmd = cmd + "+truncate";

        mu.fullSampleSetInfo.aSampleInfo[curSampleSetIndex] =
            {name: userSampleName, R1: r1_filename, R2: r2_filename, population: populationName,
                ixOrig: curSampleSetIndex, recordsAppended: -1}; // -1 can be used as flag for failed append

        if (curSampleSetIndex === 1) $('#step2_pause_cancel').removeClass("hidden");

        var usePopup = false;
        runpgm(cmd, function (data) { // data is the number of records in FASTQ pair
            var $sampleID = $("#status_" + sampleFileName);
            $sampleID.html(" " + data.trim()).removeClass("glyphicon-remove").addClass("glyphicon-ok").addClass("textgreen");

            var nRecs = parseInt(data.trim());
            mu.fullSampleSetInfo.totalRecords += nRecs;
            mu.fullSampleSetInfo.aSampleInfo[curSampleSetIndex].recordsAppended = nRecs;

            mu.aSampleName[curSampleSetIndex] = userSampleName;  // this one may get resorted

            appendDetailStr += (curSampleSetIndex+1) + " "+userSampleName  + " "+r1_filename + " "+r2_filename + " "+populationName + " "+nRecs + "\n";

            curSampleSetIndex++;
            if(curSampleSetIndex < tuples.length) {

                appendSampleSet(curSampleSetIndex,tuples);

                if ( ! elementInViewport($sampleID) && $('#step2_auto_scroll').prop( "checked" )) {
                    $('html,body').animate({scrollTop: $sampleID.offset().top}, 1000);
                }
            }
            else if (curSampleSetIndex === tuples.length) { // we're done
                mu.fullSampleSetInfo.createEnded = Date.now();
                $('#step2_pause_cancel').addClass("hidden");
                timeoutVal = setTimeout(appendCompleted, 750);
            }
        }, undefined, usePopup);
    }

    this.createFullSampleRunFiles = function () {

        var tuples = buildTupleArrayAll();
        initFullSampleSetInfo(); // initialize the data structure that keeps track of the results

        userRequestedCancel = false; userRequestedPause = false;
        appendSampleSet(0,tuples);
        //TODO: This doesn't seem to be working
        checkForExistingSamples();
        setButtonStates();

    };

    this.onCancelBtn = function() {
        userRequestedCancel = true;
    };
    this.onPauseBtn = function() {
        userRequestedPause = !userRequestedPause;
        var btntxt = (userRequestedPause) ? "Resume" : "Pause";
        $('#step2_pause_btn').text(btntxt);
    };

    this.showLog = function() {
        showObjRunLog("Sample Files Appended", mu.fullSampleSetInfo);
    };

    setup();
}

function createTooltips() {
    var tip =
        "Sample name is created with what's before the <strong>Sample delimiter</strong> in the R1 filename, or" +
        "<br/>if <strong>regex</strong> checked delimiter is interpreted as a regular expression matching the Sample name." +
        "<br/><br/>Empty Sample name fields are replaced. Click Clear Sample Names beforehand to replace all.";
    mutooltip.add("#create_sample_name", tip);

    var tip2 = "Enter Sample name manually or click here to extract the name from the filename.<br/><br/>" + tip;
    mutooltip.add("#sample_name_hdr", tip2,
        function(){$("#sample_delim_span").addClass("delimHilight")},
        function(){$("#sample_delim_span").removeClass("delimHilight")}
    );

    var poptip = "Enter Population names to group the Samples or click here to extract the name from the filename.";
    poptip += "<br><br>Population name is created with what's before the <strong>Population delimiter</strong> string in the R1 filename";
    poptip += ", or if <strong>regex</strong> checked delimter is interpeted as a regular expression. If <strong>remove trailing digits</strong> ";
    poptip += "is checked then digits at the end of the string and any dash or underscores before those digits will be removed.";
    poptip += "<br/><br/>Empty Population name fields are replaced. Click Clear Population Names beforehand to replace all.";
    mutooltip.add("#population_name_hdr", poptip,
        function(){$("#population_delim_span").addClass("delimHilight")},
        function(){$("#population_delim_span").removeClass("delimHilight")}
    );

    var sorttip = "Sort the list by Population and Sample name. " +
        "It's a good idea to sort before Creating Full Sample Run files.<br><br>" +
        "Even after this step, you can change Population names here for " +
        "use in Calling Alleles if you Sort after making your changes. " +
        "Sample name changes will have no effect after the Full Sample Run files are created.";
    mutooltip.add("#step2_sort_table", sorttip);
}