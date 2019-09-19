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
            pop_info[pop] = {min_len: mulen, max_len: mulen}
            num_pops++
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

function isPeak(primerName,sampleName, alleleLength) {
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

//
// Data only operations; creates graph info - used to be in musat_process_graph_data.js
//

function initPrimerMinMax() { // 10May2016 JBH set min max vars so any read count updates 'em
    primer_max = 0; primer_min = Number.MAX_SAFE_INTEGER; // 02May2016 JBH
}

//Extracts an array of sample names (into global "Names") and

// Maintains a running minimum and maximum value
// calls out to further refine data extents

function processData(ary) {
    for (var s = 0; s < ary.length; s++) {
        var ln = ary[s].split("\t");
        if (ln.length === 3) {
            var sample = ln[1];
            if (sample[0] === ">" || sample[0] == "@") sample = sample.substr(1);
            if (!(sample in hits)) {
                hits[sample] = [];
                names.push(sample);
            }
            var mulen = parseInt(ln[2], 10), rdcount = parseInt(ln[0], 10);
            updatePopInfo(popName(sample), mulen);
            hits[sample].push([mulen, rdcount]); // each entry is a musat len and number of reads

            primer_min = Math.min(mulen, primer_min); // 02May2016 JBH keep per file min/max
            primer_max = Math.max(mulen, primer_max);
        }
    }

    // sort the sample names from the Allele Calls file by their Population if we have that set
    // otherwise sort by Sample name itself and everything is in one big GenPop
    names.sort(sortByPopThenSample);


    gr_refineXAxis(); // 10May2016 JBH trim low count reads from sample allele len extrema
}


function gr_refineXAxis() { // 10May2016 JBH new method to size x-axis for all the plots created for this primer file
    // sample hits assumed to have been collected in hits[sample] array
    // We make 2 passes through each sample: 1st pass sets allele lens for min and for max where the
    // count for the len is > 2% of the len with the greatest number of reads for this sample.
    // As we go through this 1st pass we set the global primer_min and primer_max if this sample's min or max pts extend them.
    // 2nd pass uses this global min and max to trim each sample's left points and right points that don't fit

    initPrimerMinMax()

    // 1st pass: set primer_min and primer_max based on each sample's local min and max (currently 2% of sample's highest peak aka read count)
    for (var s=0; s < names.length; s++) {
        var sample = names[s]
        var local_extrema = getPtsExtrema(hits[sample])

        if (local_extrema) { // adjust global settings if this sample had high enough min or max to make x-axis wider
            if (local_extrema.min < primer_min)
                primer_min = local_extrema.min
            if (local_extrema.max > primer_max)
                primer_max = local_extrema.max
        }
    }

    // 2nd pass: go through the hits and remove points in hits[sample] that are outside global primer_min and primer_max allele lens
    for (var s=0; s < names.length; s++) {
        var sample = names[s]
        if (sample.endsWith("C02")) {
            var tst = hits[sample]
            var l = tst.length // stoping point for debugger
        }
        trimLowConfHits(sample, primer_min, primer_max)
    }

    // utility funcs for this procedure
    function getPtsExtrema(pts) { // pts array: each entry consisting of musat length and #reads they represent
        pts.sort() // pts sorted by allele len
        var peak = getPeak(pts) // get largest read count in pts
        if (peak >= 10) {
            var trim_count = getTrimCount(peak) // e.g. peak==1000 we would trim pts on left <=20 reads and on right <= 20 reads
            // find highest read count looking left to right that is greater than trim_count
            var local_min = peak, local_max = peak
            for (var l=0; l < pts.length; l++) {
                var rd_count = pts[l][1] // [1] is read count [0] is allele len
                if (rd_count > trim_count) {
                    local_min = pts[l][0] // first pt whose read count is > trim_count (we will need to plot it)
                    break
                }
            }
            // find highest read count looking right to left that is greater than trim_count
            for (var r=(pts.length)-1; r >= 0; r--) {
                var rd_count = pts[r][1] // [1] is read count [0] is allele len
                if (rd_count > trim_count) {
                    local_max = pts[r][0] // first pt reading from end that we will need to plot
                    break
                }
            }
        }
        else { // 15May2016 JBH don't let this sample's pts participate in extending the graph width
            return null
        }

        return { min: local_min, max: local_max }
    }

    function trimLowConfHits(sample, primer_min, primer_max) {
        // remove low_conf hits for this sample and store them in sample_pts_trimmed[sample].left[]  and sample_pts_trimmed[sample].right[]
        sample_pts_trimmed[sample] = {left: [], right: []}
        var del_pt
        var left_edge  = primer_min -1 // we provide a 1 len pad so we'' let pts here survive cut
        var right_edge = primer_max +1 // we provide a 1 len pad so we'' let pts here survive cut
        var pts = hits[sample] // pts array: each entry consisting of musat length and #reads they represent (presumed sorted by length)
        for (var r=(pts.length)-1; r >= 0; r--) { // remove pts at end of array whose lens are < primer_max
            if (pts[r][0] > right_edge) {  // len outside of rightmost plot line, read count < what fits on plot, delete this point
                del_pt = pts[r].slice(0)
                pts.splice(r, 1)
                sample_pts_trimmed[sample].right.push(del_pt)
            }
            else // stop at first point that needs to be plotted on graph
                break
        }
        while (pts.length > 0) { // remove pts at start of array whose lens are < primer_min
            if (pts[0][0] < left_edge) { // len outside of leftmost plot line, read count < what fits on plot, delete this point
                del_pt = pts[0].slice(0)
                pts.splice(0, 1)
                sample_pts_trimmed[sample].left.push(del_pt)
            }
            else // stop at first point that needs to be ploteed
                break
        }
    }

    function getPeak(info) {
        var peak = 0 // highest read count in pts defined in info
        for (var p=0; p < info.length; p++) {
            var rd_count = info[p][1] // [1] is read count [0] is allele len
            if (rd_count > peak)
                peak = rd_count
        }
        return peak
    }
    function getTrimCount(max_reads) {
        var trim_at = Math.round((max_reads+49) / 50) // get rid of anything <= 2%
        return Math.min(trim_at, max_reads-1) // max_reads must always be plotted
    }
}