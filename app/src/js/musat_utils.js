function getfile(fileName, successfunc, failfunc) {
    alert ("Delete this");
    runpgm("/bin/readfile.sh?args=" + fileName, successfunc, failfunc)
}



function saveInProject(filename, filecontents, donefunc) {
    saveAsFile(projectDirectory + "/" + filename, filecontents, donefunc)
}

function saveAsFile(filename, filecontents, donefunc) { // creates file of filename on serve
    var saveurl = "/saveas/" + filename
    var posting = $.post(saveurl, {contents: filecontents}) // Send the data using post
    posting.done(function (data) {
            if (donefunc)
                donefunc(data) // data is "saved" on success, error message otherwise
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            alert(textStatus + "\n" + errorThrown)
        })
}

function isPeak(primerName,sampleName, alleleLength) {
    /*
    var curSamplePeaks = mu.oLocusCalls[primerName][sampleName];
    if (!curSamplePeaks)
        return false;
    for (var i = 0; i < curSamplePeaks.length; i++) {
        if (curSamplePeaks[i][0] === alleleLength)
            return true;
    }
    */

    return false;
}

function getReadCount(primerName, sampleName, alleleLength) {
    var sampleDataArray = mu.oLocusCalls[primerName];
    var reads = -1;
    for (var index in sampleDataArray[sampleName]) {
        var curLength = sampleDataArray[sampleName][index][0];

        reads = sampleDataArray[sampleName][index][1];
        if (curLength === alleleLength) {
            break;
        }
    }
    return reads;
}

function handleAjaxError  (jqXHR, textStatus, errorThrown) {
    payloadText = jqXHR["responseText"];
    payloadCode = jqXHR["status"];
    alert ("Server returned error: \n" + errorThrown +"\nError code: " + payloadCode);
}

function checkIsDirectory(check_directory) {

    var isValidDirectory = false;
    if (check_directory === "") // quicker for this case and /is_directory returns true for empty string
        return false;

    $.ajax({
        type: "GET",
        url: '/is_directory',
        data: {
            "directory": check_directory
        },
        dataType: "text",
        error: function(data) {
            isValidDirectory = data;
        },
        success: function (data) {
            isValidDirectory = data;
        },
        async: false
    });
    return  isValidDirectory === "true";

}

function checkIsFile(check_file) {
    var isValidFile = false;
    $.ajax({
        type: "GET",
        url: '/is_file',
        data: {
            "file": check_file
        },
        dataType: "text",
        error: function(data) {
            isValidFile = data;
        },
        success: function (data) {
            isValidFile = data;
        },
        async: false
    });
    return  isValidFile === "true";
}


function getDirectoryListing() {
    var files = {};
    $.ajax({
        type: "GET",
        url: '/directory_listing',
        data: {
            "directory": mu.projectDirectory
        },
        dataType: "text",
        error: handleAjaxError,
        success: function (data) {
            files = data;
        },
        async: false
    });
    return JSON.parse(files);
}

function getFastqFileListing(dir) {
    dir = (dir) ? dir : mu.projectDirectory;
    var files = {};
    $.ajax({
        type: "GET",
        url: '/fastq_directory',
        data: {
            "directory": dir
        },
        dataType: "text",
        error: handleAjaxError,
        success: function (data) {
            files = data;
        },
        async: false
    });
    return JSON.parse(files);
}

function tsvJSON(tsv){
    var lines=tsv.trim().split("\n");
    var result = [];
    var headers=lines[0].split("\t");
    for(var i=0;i<headers.length;i++){
        headers[i]=headers[i].trim();
    }

    for(var i=1;i<lines.length;i++){
        var obj = {};
        var currentline=lines[i].split("\t");

        for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);
    }

    return result;
}

// left as top-level function in case we want to call it other than from musat_results.js,
// however we should transition away from using the 'names' var and use mu.aSampleName instead.
// in that case the main use of this is to do the natural sort of the array
// (our test data is already so sorted but that might not always be so)
function prepSampleNames() {
    // if the mu.aSampleName array has not been created, create it, and/or if it is empty, fill it with names and sort it
    var ferryFromNames = false;

    if ( (!mu.aSampleName || mu.aSampleName.length === 0) && (names && names.length > 0) )
        ferryFromNames = true;
    if ((mu.aSampleName && name) && (mu.aSampleName.length < names.length)) // used scatter and added even more samples
        ferryFromNames = true;

    if (ferryFromNames) {
        mu.aSampleName = [];
        for (var n=0; n < names.length; n++) {
            mu.aSampleName[n] = names[n];
        }
    }
    mu.aSampleName.sort(sortByPopThenSample); // new sort technique sorts by Population name then Sample name
}

function getAlleleLenFilename(curLocus) {
    // windows compatability - slash. Do a debug stop; this might be present already and this doubles it
    // it's ok, no slash ending mu.projectDirectory

    return mu.projectDirectory + "/" + getAlleleLenNamePart(curLocus);
}
function getAlleleLenNamePart(curLocus) {
    return curLocus + '_AlleleLens.txt';
}

function getAlleleLenFile(curLocus) {
    // TODO hardcoded "AlleleLens.txt"
    var dataFile;
    $.ajax({
        type: "GET",
        url: '/get_file',
        data: {
            "file": getAlleleLenFilename(curLocus)
        },
        dataType: "text",
        error: handleAjaxError,
        success: function (data) {
            dataFile = data.trim();
        },
        async: false
    });
    return dataFile;
}

// copied here from musat_results.js since it is of general use
function copyTextToClipboard(el) {
    var range = document.createRange(); // create new range object
    range.selectNodeContents(el); // set range to encompass desired element text
    var selection = window.getSelection(); // get Selection object from currently user selected text
    selection.removeAllRanges(); // unselect any user selected text (if any)
    selection.addRange(range); // add range to Selection object to select it

    var copysuccess; // var to check whether execCommand successfully executed
    try {
        copysuccess = document.execCommand("copy") // run command to copy selected text to clipboard
    } catch (e) {
        copysuccess = false
    }
    if (copysuccess) { // leave highlighted if unsuccessfully copied
        selection.removeAllRanges()
    }
    return copysuccess
}

// hide names of object where these are found
function getLocusName(index) {
    if (index < 0 || index >= mu.primerJSON.length)
        return "";

    return mu.primerJSON[index]["Locus Name"];
}
function numLocusNames() {
    return (mu && mu.primerJSON) ? mu.primerJSON.length : 0;
}

function getLocusObj(locusNm) {
    if (mu.locusFileResults && mu.locusFileResults.primerJSON) {
        var len = mu.locusFileResults.primerJSON.length;
        for (var ix=0; ix < len; ix++) {
            if (mu.locusFileResults.primerJSON[ix]["Locus Name"] === locusNm)
                return mu.locusFileResults.primerJSON[ix];
        }
    }
    return undefined;
}

function numLociCalled() {
    var called = 0;
    if (mu.oLocusCalls) {
        for (var ob in mu.oLocusCalls)
            if (mu.oLocusCalls.hasOwnProperty(ob))
                called++
    }
    return called;
}
function allLociCalled() {
    return numLocusNames() > 0 && (numLocusNames() === numLociCalled());
}

// trim last part of path if fullpath is not a dir. this may still not be valid so should be checked again
function getDirFromPath(filepath) {
    var directory = filepath.trim();
    if ( directory !== "" && ! checkIsDirectory(directory) )
        directory = filepath.substring(0, filepath.lastIndexOf("/"));

    return directory;
}

function elementInViewport( $ele ) {
    var elementTop = $ele.offset().top;
    var elementBottom = elementTop + $ele.outerHeight();

    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();

    return elementBottom > viewportTop && elementTop < viewportBottom;
}

function guessPopName(sample) { // presume each sample has number at name's end and prefix prior to that identifies a Population
    var pop = "";
    for (var i = sample.length - 1; i > 0; i--) {
        var d = sample[i];
        if (d < "0" || d > "9") {
            if (d === "-" || d === "_") i--;
            pop = sample.substr(0, i + 1);
            break
        }
    }
    return pop;
}

mutooltip = {
    create: function() { // put tooltip element at end of body
        $('body').append('<span id="mutooltip" class="mu_tooltip">tip</span>');
    },
    move: function(x, y) {
        this.moveTo("mutooltip", x, y);
    },
    add: function(id, tip, fncIn, fncOut) {
        $(id).mouseenter(function(event) { // show bracket info in tooltip
            $("#mutooltip")
                .html(tip)
                .show();
            var cursorX = event.pageX;
            var pos = $(this).offset(), height = $(this).outerHeight();
            mutooltip.move(/*pos.left + 15*/ cursorX, pos.top + height + 4);
            if (typeof fncIn === 'function') {
                fncIn(id);
            }
        }).mouseleave(function() { // hide tooltip
            $("#mutooltip").hide();
            mutooltip.move(-1000, -1000);
            if (typeof fncOut === 'function') {
                fncOut(id);
            }
        })
    },
    moveTo: function(eleStr, x, y) { // str id and integer for left and top
        var ele = document.getElementById(eleStr);
        var styl = ele.style;
        styl.position = 'absolute';
        styl.left = x + 'px';
        styl.top  = y + 'px';
    }
};

function fmtMSS(s){return(s-(s%=60))/60+(9<s ?'m ' : 'm 0')+s+'s'}

// using ugly javascript confirm now but this is the one place to change it when desired;
// can pass in a msg, if not we'll use a generic msg
function confirmFileRemoval(msg) {
    if (!msg || msg === "")
        msg = "Are you sure you want to Remove these Files?";

    return confirm(msg);
}

function sampleObj(sample) { // return reference to sampleObj that has population name and other sample items
    return undefined;
}

// we want sample names sorted first by their Population membership and then by Sample name
// and of course the sort must be a natural sort so ABC-10 sorts after ABC-2
function sortByPopThenSample(aSamp, bSamp) {
    var aObj = sampleObj(aSamp), bObj = sampleObj(bSamp);
    if (!aObj || !bObj) // we don't have population name, just sort by sample name
        return naturalSort(aSamp, bSamp);

    var popCmp = naturalSort(aObj.population, bObj.population);
    if (popCmp === 0)
        return naturalSort(aObj.name, bObj.name);

    return popCmp;
}

/*
 * Natural Sort algorithm for Javascript - Version 0.8.1 - Released under MIT license
 * Author: Jim Palmer (based on chunking idea from Dave Koelle)
 */
function naturalSort(a, b) {
    var re = /(^([+\-]?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?(?=\D|\s|$))|^0x[\da-fA-F]+$|\d+)/g,
        sre = /^\s+|\s+$/g,   // trim pre-post whitespace
        snre = /\s+/g,        // normalize all whitespace to single ' ' character
        dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
        hre = /^0x[0-9a-f]+$/i,
        ore = /^0/,
        i = function (s) {
            return (naturalSort.insensitive && ('' + s).toLowerCase() || '' + s).replace(sre, '');
        },
        // convert all to strings strip whitespace
        x = i(a),
        y = i(b),
        // chunk/tokenize
        xN = x.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0'),
        yN = y.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0'),
        // numeric, hex or date detection
        xD = parseInt(x.match(hre), 16) || (xN.length !== 1 && Date.parse(x)),
        yD = parseInt(y.match(hre), 16) || xD && y.match(dre) && Date.parse(y) || null,
        normChunk = function (s, l) {
            // normalize spaces; find floats not starting with '0', string or 0 if not defined (Clint Priest)
            return (!s.match(ore) || l == 1) && parseFloat(s) || s.replace(snre, ' ').replace(sre, '') || 0;
        },
        oFxNcL, oFyNcL;
    // first try and sort Hex codes or Dates
    if (yD) {
        if (xD < yD) {
            return -1;
        }
        else if (xD > yD) {
            return 1;
        }
    }
    // natural sorting through split numeric strings and default strings
    for (var cLoc = 0, xNl = xN.length, yNl = yN.length, numS = Math.max(xNl, yNl); cLoc < numS; cLoc++) {
        oFxNcL = normChunk(xN[cLoc] || '', xNl);
        oFyNcL = normChunk(yN[cLoc] || '', yNl);
        // handle numeric vs string comparison - number < string - (Kyle Adams)
        if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {
            return isNaN(oFxNcL) ? 1 : -1;
        }
        // if unicode use locale comparison
        if (/[^\x00-\x80]/.test(oFxNcL + oFyNcL) && oFxNcL.localeCompare) {
            var comp = oFxNcL.localeCompare(oFyNcL);
            return comp / Math.abs(comp);
        }
        if (oFxNcL < oFyNcL) {
            return -1;
        }
        else if (oFxNcL > oFyNcL) {
            return 1;
        }
    }
    return 0;
}