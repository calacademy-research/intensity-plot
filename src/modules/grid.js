import $ from "jquery"
import {processData} from "./data"

// TODO: add stub for "grouping" and pre-break grid graphs out

let gridsByLocus = {};
let gridGraphCurLocus;


function processUnifiedFile(primerName, filename, data) {
    var ary = data.split("\n");
    if (ValidFile(ary[0], ary[1])) {
        // setFile(filename, "gridPrimer");
        processData(ary);
        finalizeGridGraph(primerName);
    }
}

// callback from processUnifiedFile
function finalizeGridGraph(primerName) {
    // Disable previous locus
    if (gridGraphCurLocus) {
        gridsByLocus[gridGraphCurLocus].disableLocus();
    }
    if (!gridsByLocus[primerName]) {
        gridsByLocus[primerName] = new GridLocus(primerName, hits, trait_min, trait_max, names, primerName);
    }
    gridGraphCurLocus = primerName;
    updateAlleleCountsDisplay('#explore_scatter',primerName,true);

}

export {processUnifiedFile}