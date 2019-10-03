import $ from "jquery"
import { g, pop_info, mu } from "./musat_global"

// lookup population name in data structure, if not there, use guessPopName()
function popName(sample) {
    var pop = "";
    var oSamp = sampleObj(sample);

    pop = (oSamp) ? oSamp.population : guessPopName(pop);
    pop = (pop === "") ? "GenPop" : pop;

    return pop;
}



function updatePopInfo(pop, mulen) {
    if (pop && pop !== "") {
        if (!(pop in pop_info)) { // remember min and max musat lengths for a population
            pop_info[pop] = { min_len: mulen, max_len: mulen }
            g.num_pops++
        } else {
            if (mulen < pop_info[pop].min_len)
                pop_info[pop].min_len = mulen
            if (mulen > pop_info[pop].max_len)
                pop_info[pop].max_len = mulen
        }
    }
}

// updates the number of called samples in the DOM
function setCalledIndicators(parent, numCalled, curPrimerName) {
    // var numCalledStr = (numCalled > 0) ? numCalled.toString() : ""; // don't show zero 08Nov2017 JBH
    var numCalledStr = numCalled.toString();

    var colContents = "<span class='chkmrk'>&#10003;</span> &nbsp;<span class='calledsamps'>" + numCalledStr + "</span>";

    var $callCol = $(parent).find("#" + curPrimerName + " .calledCol");
    if ($callCol.length === 0) // we might have changed to table format
        $callCol = $(parent).find("#" + curPrimerName).siblings(".calledCol");

    $callCol.html(colContents);
    $(parent).find("#" + curPrimerName).removeClass("processing")

}

function isPeak(primerName, sampleName, alleleLength) {
    var curSamplePeaks = mu.oLocusCalls[primerName][sampleName];
    if (!curSamplePeaks)
        return false;
    for (var i = 0; i < curSamplePeaks.length; i++) {
        if (curSamplePeaks[i][0] === alleleLength)
            return true;
    }

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

let mutooltip = {
    create: function () { // put tooltip element at end of body
        $('body').append('<span id="mutooltip" class="mu_tooltip">tip</span>');
    },
    move: function (x, y) {
        this.moveTo("mutooltip", x, y);
    },
    add: function (id, tip, fncIn, fncOut) {
        $(id).mouseenter(function (event) { // show bracket info in tooltip
            $("#mutooltip")
                .html(tip)
                .show();
            var cursorX = event.pageX;
            var pos = $(this).offset(), height = $(this).outerHeight();
            mutooltip.move(/*pos.left + 15*/ cursorX, pos.top + height + 4);
            if (typeof fncIn === 'function') {
                fncIn(id);
            }
        }).mouseleave(function () { // hide tooltip
            $("#mutooltip").hide();
            mutooltip.move(-1000, -1000);
            if (typeof fncOut === 'function') {
                fncOut(id);
            }
        })
    },
    moveTo: function (eleStr, x, y) { // str id and integer for left and top
        var ele = document.getElementById(eleStr);
        var styl = ele.style;
        styl.position = 'absolute';
        styl.left = x + 'px';
        styl.top = y + 'px';
    }
};

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
    var re = /(^([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?(?=\D|\s|$))|^0x[\da-fA-F]+$|\d+)/g,
        sre = /^\s+|\s+$/g,   // trim pre-post whitespace
        snre = /\s+/g,        // normalize all whitespace to single ' ' character
        dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[/-]\d{1,4}[/-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
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

export {
    naturalSort, 
    sortByPopThenSample,
    popName, 
    updatePopInfo, 
    isPeak,
    getReadCount, 
    guessPopName,
    sampleObj,
}