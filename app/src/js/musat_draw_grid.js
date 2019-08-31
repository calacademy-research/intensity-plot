// rainbow
//https://github.com/anomal/RainbowVis-JS/blob/master/example.html


var gridsByLocus = {};


// TODO: add stub for "grouping" and pre-break grid graphs out


var gridGraphCurLocus;
function setupGridGraph(primerName) {
    reset_globals();
    // curLocus = null;
    if (gridsByLocus[primerName] === null || gridsByLocus[primerName] === undefined) {
        loadData(primerName, projectDirectory + primerName + primer_suffix);
    } else {
        gridsByLocus[gridGraphCurLocus].disableLocus();
        gridsByLocus[primerName].enableLocus();
        gridGraphCurLocus = primerName;

    }
    $("#scatter_cur_locus").html(primerName); // so we know which locus we are working with
    // continued in finalizeGridGraph
}

// global namespace for adding a new grid graph
function addGridGraph(sampleDataArray,sampleNameArray) {
    gridsByLocus[gridGraphCurLocus].addGridGraph(sampleDataArray,sampleNameArray);
}

function removeGridGraph() {
    gridsByLocus[gridGraphCurLocus].removeGridGraph();
}

function loadData(primerName, filename) {
    var data = getAlleleLenFile(primerName);
    processUnifiedFile(primerName, filename, data, function (jqXHR, textStatus, errorThrown) {
        alert("Can't load file...");
    });

}

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
        gridsByLocus[primerName] = new GridLocus(primerName, hits, primer_min, primer_max, names, primerName);
    }
    gridGraphCurLocus = primerName;
    updateAlleleCountsDisplay('#explore_scatter',primerName,true);

}



























