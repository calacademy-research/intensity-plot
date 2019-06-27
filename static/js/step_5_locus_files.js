function Step5() {
    var primerTsv = null;
    var curPrimerIndexNum = 0;
    var maxPrimerIndexNum = 0;
    var primerFileDetailStr = "";
    // Prereq: MergeFullRun.assembled.fastq exists
    // when primer_info.tsv is loaded, display the full table
    // stretch: Allow editing of said table
    // "Create locus files button" will run thing.
    // TODO: warn if reverse primer looks like it is already revcomped

    function setup() {
        // if we change project, values from old project sticks around for these. clean them up
        $("#primer_file").val("");
        $("#primer_table").addClass('hidden');
        $("#primer_table_body").text('');
    }


    // populate "matching reads" and "samples" row.
    // outputs "AlleleLens" files.
    function show() {
        updateDisplay();

        var $primer_file = $("#primer_file");
        var primerFileValue = $primer_file.val();
        generateButtonState(false);

        if (primerFileValue.length === 0)
            $primer_file.val(mu.projectDirectory);
        else
            $primer_file.attr('size', Math.max(60, primerFileValue.length+2))
    }

    function getUserTsvFilenameFromPastRun() {
        var dataFile = "";

        if (mu.primerFileName && mu.primerFileName !== "")
            dataFile = mu.primerFileName;

        /* rely on muinfo.json entry
        $.ajax({
            type: "GET",
            url: '/get_file',
            data: {
                "file": mu.projectDirectory + '/user_input_file_allelelens.txt'
            },
            dataType: "text",
            error: handleAjaxError,
            success: function (data) {
                dataFile = data.trim();
            },
            async: false
        });
        */

        return dataFile;
    }

    function updateDisplay() {
        mu.flow.setCurStepFromServer();

        step = mu.flow.getServerSideStep();
        // if all the files exist, then we're ready for the next step.
        if (step === 5) {
            setNextButtonState(false);
            $("#step_5_allele_files_created").addClass('hidden');
            if (mu.primerFileName && mu.primerFileName !== "")
                $("#primer_file").val(mu.primerFileName);
        }

        // If we're all done, rebuild the primer table and the
        // path we used to the user data file.
        if (step === 6) {
            $("#step_5_allele_files_created").removeClass('hidden');
            setNextButtonState(true);
            generateButtonState(false);

            reShowPrimerTable();

            $('.step5').find('#primer_table').removeClass('hidden');
            $('#prep_complete').html("&#10003;");
        }
        else
            $('#prep_complete').html("&nbsp;");

        if (mu.explore && mu.explore.updateIndicator)
            mu.explore.updateIndicator();

        // we use the primer table info in mu.locusFileResults.primerJSON object or reload from the file
        function reShowPrimerTable() {
            var ob = mu.locusFileResults;
            var useMuInfo = (ob && ob.primerFileName && ob.primerFileName!=="" && ob.primerJSON && ob.primerJSON.length > 0);
            if (useMuInfo) {
                $("#primer_file").val(ob.primerFileName);
                showPrimerGrid(ob.primerJSON);
            } else {
                var dataFile = getUserTsvFilenameFromPastRun();
                $("#primer_file").val(dataFile);
                generatePrimerTable(dataFile);
                updatePrimerCounts();
            }
        }
    }

    function updatePrimerCounts() { // migrating away from this one
        var primerCountsTsv;
        $.ajax({
            type: "GET",
            url: '/get_file',
            data: {
                "file": mu.projectDirectory + '/primer_counts.tsv'
            },
            dataType: "text",
            error: handleAjaxError,
            success: function (data) {
                primerCountsTsv = data;
            },
            async: false
        });
        primerCountsJson = tsvJSON(primerCountsTsv);

        // iterate and populate the counts
        for (var i = 0; i < primerCountsJson.length; i++) {

            var data = primerCountsJson[i];
            locus = data['Locus Name'];
            numReads = data['Matching Reads'];
            numSamps = data['Samples'];
            $("#Reads_" + locus).html(numReads);
            $("#Samples_" + locus).html(numSamps);
        }
    }




    function setNextButtonState(filesExist) {
        if (filesExist) {
            // $('.step3').find('#create_button').prop('disabled', false);
            $('.step5').find('.nextButton').prop('disabled', false);

        } else {
            // $('.step3').find('#create_button').prop('disabled', true);
            $('.step5').find('.nextButton').prop('disabled', true);

        }

    }

    function generateButtonState(enable) {
        $('.step5').find('#generate_button').prop('disabled', !enable);
    }

    function getTsvFile(primerFile) {
        $.ajax({
            type: "GET",
            url: '/get_file',
            data: {
                "file": primerFile
            },
            dataType: "text",
            error: handleAjaxError,
            success: function (data) {
                primerTsv = data;
            },
            async: false
        });

        // segue away from using the text file create below
        mu.primerFileName = primerFile;
        muSaveData();

        return primerTsv;

        /* we can move away from this file and rely on mu.primerFileName
        $.ajax({
            type: "POST",
            url: '/create_file',
            data: {
                "file": mu.projectDirectory+"/"+"user_input_file_allelelens.txt",
                "payload": primerFile
            },
            dataType: "text",
            error: handleAjaxError,
            async: false
        });
        */
    }

    function verifyTsvFile(primerFile) {

        $('.primer_file_name_msg').text(mu.primerFileName); // include primer file name in any error msgs

        if (!checkIsFile(primerFile)) {
            $('#invalid_primer_file').removeClass('hidden');
            return false;
        } else {
            $('#invalid_primer_file').addClass('hidden');
        }
        primerTsv = getTsvFile(primerFile);

        return (primerTsv && primerTsv.length > 0)

        //TODO: Verify that primerFile conforms to TSV format
    }

    function generatePrimerTable(primerFile) {
        if (!verifyTsvFile(primerFile)) {  // populates primerTsv var as side-effect on success
            return false;
        }

        step = mu.flow.getServerSideStep();
        generateButtonState( step < 6 ); // 6 means we have AlleleFiles

        //
        //   Generate the table
        var lines = primerTsv.trim().split("\n");
        var headers = lines[0].split("\t");
        for (var i = 0; i < headers.length; i++) {
            headers[i] = headers[i].trim();
        }
        if (headers[0].localeCompare('Locus Name')) {
            primerTsv = "Locus Name\tForward Primer\tReverse Primer\tMotif\n" + primerTsv;
        }

        $('.primer_file_name_msg').text(mu.primerFileName); // include primer file name in any error msgs

        mu.primerJSON = tsvJSON(primerTsv);
        if (mu.primerJSON === null || mu.primerJSON === 'undefined') {
            $('#primer_file_malformed').removeClass('hidden');
            return;
        }

        if (typeof mu.primerJSON[0] === 'undefined') {
            $('#primer_file_malformed').removeClass('hidden');
            return;
        }

        $('#primer_file_malformed, #primer_file_bad_line').addClass('hidden');
        showPrimerGrid(mu.primerJSON);
    }

    function showPrimerGrid(primerJson) {
        var $primer_table_body = $('#primer_table_body').empty();
        var $primer_table = $('#primer_table');

        var curLine = 0, missingMotifField = false;
        var curLocus;
        // primerJson - Array of Objects. Each object contains map of colHeader names to colData.
        for (var i = 0; i < primerJson.length; i++) {

            var data = primerJson[i];
            curLocus = data['Locus Name'];
            var row = "<tr id=Row_" + curLocus + ">";

            var curCol = 0;
            // data - mapping of colHeader names to colData
            for (var colHeader in data) {
                var colData = data[colHeader];
                curCol++;
                if (typeof colData === 'undefined') {
                    if (colHeader !== "Motif") { // missing Motif column is tolerable
                        $('#primer_file_bad_line').removeClass('hidden');
                        $('.step5').find('#line_info').text('Malformed line ' + curLine + 1 + ', Column ' + curCol + ": '" + colHeader + "'");
                        $primer_table.addClass('hidden');
                        return;
                    }
                    else {
                        colData = "";
                        missingMotifField = true;
                    }
                }
                if (colHeader==='Reads' || colHeader==='Samples')
                    row += '<td id="'+colHeader+'_' + curLocus + '" class="right-align">' + colData + '</td>';
                else
                    row += '<td>' + colData + '</td>';
            }

            if (!data.Reads) row += '<td id="Reads_' + curLocus + '" class="right-align"></td>';
            if (!data.Samples) row += '<td id="Samples_' + curLocus + '" class="right-align"></td>';

            row += '</tr>';
            $primer_table_body.append(row);
            curLine++;
        }
        $primer_table.removeClass('hidden');

    }


    function primerFileGenerated(textJson) {
        var data = JSON.parse(textJson);
        var locus = data[0];
        var numReads = data[1];
        var numSamps = data[2];
        $("#Reads_" + locus).text(numReads);
        $("#Samples_" + locus).text(numSamps);

        var locusFilename = getAlleleLenFilename(locus);
        mu.locusFileResults.files[curPrimerIndexNum] = locusFilename;
        mu.locusFileResults.primerJSON[curPrimerIndexNum] = {};
        $.extend(true, mu.locusFileResults.primerJSON[curPrimerIndexNum], mu.primerJSON[curPrimerIndexNum]);
        mu.locusFileResults.primerJSON[curPrimerIndexNum].Reads   = numReads;
        mu.locusFileResults.primerJSON[curPrimerIndexNum].Samples = numSamps;

        var detail = (curPrimerIndexNum+1) + " "+locus + " "+numReads +" Reads, " + numSamps + " Samples, File " + locusFilename + "\n";
        primerFileDetailStr += detail;

        curPrimerIndexNum++;
        if (curPrimerIndexNum < maxPrimerIndexNum) {

            if ( ! isRunClosed() ) {
                var hdr = "Generating allele file for " + mu.primerJSON[curPrimerIndexNum]['Locus Name'];
                $("#run_progress_header").text(hdr);
                $("#run_progress_content").append(detail);
                generatePrimerFileN(curPrimerIndexNum);
            }
            else
                runCancelled();

        } else {
            runComplete();
        }

        function runComplete() {
            stopSpin();
            $("#run_progress").css("visibility", "hidden").css("opacity", "0");

            generateButtonState(false);
            $("#step_5_allele_files_created").removeClass('hidden');
            setNextButtonState(true);

            mu.locusFileResults.log = mu.primerFileName + "\n" +
                curPrimerIndexNum + " Locus Allele length files created.\n\n" + primerFileDetailStr;
            mu.locusFileResults.createEnded = Date.now();
            mu.locusFileResults.secsToCreate = parseInt( (mu.mergeResults.createEnded - mu.mergeResults.createStarted) / 1000 ) + 1;

            muSaveData();
        }

        // todo: figure out appropriate cleanup when run is cancelled
        function runCancelled() {

        }
    } // primerFileGenerated

    function generatePrimerFiles(event) {
        curPrimerIndexNum = 0;
        maxPrimerIndexNum = mu.primerJSON.length;

        initializeResultsObj();

        mu.oLocusCalls = {};

        $("#run_progress_header").text("Generating allele file for " + mu.primerJSON[curPrimerIndexNum]['Locus Name']);
        $("#run_progress").css("visibility", "visible").css("opacity", "1");
        doSpin();

        generatePrimerFileN(curPrimerIndexNum);
    }
    function initializeResultsObj() {
        mu.locusFileResults = {primerFileName: mu.primerFileName, files: [], primerJSON: [], log: ""};
        mu.locusFileResults.createStarted = Date.now(); // millisecs. for readable d = new Date(milli); d.toDateString()
        mu.locusFileResults.createEnded = Date.now();
        mu.locusFileResults.secsToCreate = 0; // this will indicate an error if written out as 0
        primerFileDetailStr = "";
    }

    function generatePrimerFileN(n) {
        var data = mu.primerJSON[n];
        $.ajax({
            type: "GET",
            url: '/create_locus_file',
            data: {
                "directory": mu.projectDirectory,
                "input_file": 'MergeFullRun.assembled.fastq', // TODO: options, hardcoding bad.
                "locus_name": data['Locus Name'],
                "forward_primer": data['Forward Primer'],
                "reverse_primer": data['Reverse Primer']
            },
            dataType: "text",
            error: handleAjaxError,
            success: primerFileGenerated,
            async: true
        });

    }

    this.showLog = function() {
        showObjRunLog("Locus Allele File creation", mu.locusFileResults);
    };

    function removeExistingFiles() {
        if (! confirmFileRemoval()) return;
        $.ajax({
            type: "GET",
            url: '/remove_files_for_step',
            data: {
                "directory": mu.projectDirectory,
                "step_number": 5
            },
            dataType: "text",
            error: handleAjaxError,
            success: function (data) {
                updateDisplay();
            },
            async: false
        });
        $('.step5').find('#primer_table').addClass('hidden');
        $("#primer_file").val(mu.projectDirectory);
        updateDisplay();
    }

    this.removeExistingFiles = removeExistingFiles;
    this.generatePrimerFiles = generatePrimerFiles; // GET /bin/create_locusfile.py?args=/Users/joe/bathwater_data/MergeFullRun.assembled.fastq+/Users/joe/bathwater_data/TG_MS1_AlleleLens.txt+TGCACCCGTGTTCAATTTC+CACGGTGTCCAGAAATGCC HTTP/1.1" 200 -
    this.choosePrimer = generatePrimerTable;
    this.show = show;

    setup();
}