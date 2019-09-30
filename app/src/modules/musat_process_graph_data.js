import { sortByPopThenSample, popName, updatePopInfo } from "./musat_utils"
import { initPrimerMinMax } from "./musat_global"
import { g, hits, names, sample_pts_trimmed } from "./musat_global"

//
// Data only operations; creates graph info
//

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

            g.primer_min = Math.min(mulen, g.primer_min); // 02May2016 JBH keep per file min/max
            g.primer_max = Math.max(mulen, g.primer_max);
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
    for (let s = 0; s < names.length; s++) {
        let sample = names[s]
        let local_extrema = getPtsExtrema(hits[sample])

        if (local_extrema) { // adjust global settings if this sample had high enough min or max to make x-axis wider
            if (local_extrema.min < g.primer_min)
                g.primer_min = local_extrema.min
            if (local_extrema.max > g.primer_max)
                g.primer_max = local_extrema.max
        }
    }

    // 2nd pass: go through the hits and remove points in hits[sample] that are outside global primer_min and primer_max allele lens
    for (let s = 0; s < names.length; s++) {
        let sample = names[s]
        if (sample.endsWith("C02")) {
            var tst = hits[sample]
            var l = tst.length // stoping point for debugger
        }
        trimLowConfHits(sample, g.primer_min, g.primer_max)
    }

    // utility funcs for this procedure
    function getPtsExtrema(pts) { // pts array: each entry consisting of musat length and #reads they represent
        pts.sort() // pts sorted by allele len
        var peak = getPeak(pts) // get largest read count in pts
        let local_min
        let local_max
        if (peak >= 10) {
            let trim_count = getTrimCount(peak) // e.g. peak==1000 we would trim pts on left <=20 reads and on right <= 20 reads
            // find highest read count looking left to right that is greater than trim_count
            local_min = local_max = peak
            for (let l = 0; l < pts.length; l++) {
                let rd_count = pts[l][1] // [1] is read count [0] is allele len
                if (rd_count > trim_count) {
                    local_min = pts[l][0] // first pt whose read count is > trim_count (we will need to plot it)
                    break
                }
            }
            // find highest read count looking right to left that is greater than trim_count
            for (let r = (pts.length) - 1; r >= 0; r--) {
                let rd_count = pts[r][1] // [1] is read count [0] is allele len
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
        sample_pts_trimmed[sample] = { left: [], right: [] }
        var del_pt
        var left_edge = primer_min - 1 // we provide a 1 len pad so we'' let pts here survive cut
        var right_edge = primer_max + 1 // we provide a 1 len pad so we'' let pts here survive cut
        var pts = hits[sample] // pts array: each entry consisting of musat length and #reads they represent (presumed sorted by length)
        for (var r = (pts.length) - 1; r >= 0; r--) { // remove pts at end of array whose lens are < primer_max
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
        for (var p = 0; p < info.length; p++) {
            var rd_count = info[p][1] // [1] is read count [0] is allele len
            if (rd_count > peak)
                peak = rd_count
        }
        return peak
    }
    function getTrimCount(max_reads) {
        var trim_at = Math.round((max_reads + 49) / 50) // get rid of anything <= 2%
        return Math.min(trim_at, max_reads - 1) // max_reads must always be plotted
    }
}

function ValidFile(ln1, ln2) { // current validity check just verifies first 2 lines (might allow 1st to be headers later)
    return isValidLine(ln1) && isValidLine(ln2)
}
function isValidLine(ln) { // each line should have 3 or 4 tab delimited fields, first and third of which are integers
    var flds = ln.split("\t")
    return (flds.length == 3 || flds.length == 4) && isInt(flds[0]) && isInt(flds[2])
}
function isInt(int_candidate) {
    var val = parseInt(int_candidate, 10)
    return !isNaN(val)
}

export { processData } 