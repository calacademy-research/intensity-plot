import $ from "jquery"

// primer_nm is the name of the current primer file, aka allele locus name.
let g = {
    curfile: null, 
    primer_nm: 0, 
    primer_min: 0, 
    primer_max: 0, 
    primer_suffix: "_AllelCall.txt", //02May2016 JBH add min max
    num_pops: 0, // number of populations
}

// 20May2016 JBH these globals relate to the currently read locusfile (curfile)
let hits = {}
// data (into global "hits", json structure)
// hits[sample_name]=[[musat length, number of reads]]
// assigned in musat_process_graph_data::processData
// Only contains the data for the currently showing graph.

let orig_hits = {}
let pop_info = {}
let pts_merged = {}
let names = [] // each sample name in this array is also in the hits object above with its own array of hit info
let sample_pts_trimmed = {}; // 10May2016 JBH each sample has .left and .right arrays to show any pts trimmed when having too few reads for distal support


function initPrimerMinMax() { // 10May2016 JBH set min max vars so any read count updates 'em
    g.primer_max = 0
    g.primer_min = Number.MAX_SAFE_INTEGER; // 02May2016 JBH
}


// Globals to track called Alleles:
//
// * mu.oLocusCalls object has properties named for each locus file's name (prefix of filename usually)
//    each of which is an object containing properties named for the samples found in the locusfile
//    these sample properties contain an array of pts (pts are arrays with just 2 entries --
//    [0] for musat length, [1] for #reads)
//  primerName (locus):
//     sampleName:
//        
//    Example: oLocusCalls
//  'TG_MS1':
//
//    'HiBiK15-01':Array[0] // no called alleles for HiBiK15-01
//    'HiBiK15-02':Array[2] // alleles at 145 and 159
//     0:Array[2]
//         0:145
//         1:359
//     1:Array[2]
//         0:159
//         1:511
//  'TG_MS2': ...






// aSampleName is the set of all the sample names found in locus files (many are found in all files but not necessarily all)

// These objects are in mu. The 2 arrays should be kept in natural sort order [ e.g. mu.aSampleName.sort(naturalSort) ]
// mu data is persisted in muinfo.json in the projectDirectory so that it can be read back in when Project revisited
let mu = {
    muInfoFile: "muinfo.json",
}

let options;
let htmlOptions;
function reset_mu() {
    mu = {
        STEPS: 5, // const; the number of steps in this process.
        flow: {}, // Flow object (steps through the pipeline)
        explore: {}, // explore object
        projectDirectory: "", // current project directory
        main: {} // Main object for legacy // this is still used for setdirectory() not just legacy
    };
    reset_mu_data();
}

function reset_mu_data() { // called from muLoadData so if we change to new project, no carryover from old project
    mu.oLocusCalls = {};
    mu.aSampleName = [];
    mu.primerFileName = "";
    mu.primerJSON = []; // the contents of the primer .tsv file mu.primerFileName
    mu.trimResults = {};
    mu.mergeResults = {};
    mu.locusFileResults = {};
    mu.resultsInfo = {}; // holds ids of sample and loci not to be used in export. also holds overridden allele calls
    mu.callAlleleDefaultView = "bars"; // one of "bars" or "scatter" for now
    mu.workingDirectory = "";
    initFullSampleSetInfo(mu);
}
function initFullSampleSetInfo() {
    mu.fullSampleSetInfo = {}; // holds sample name and file names, along with rec counts for FullSampleRun files
    mu.fullSampleSetInfo.totalRecords = 0;
    mu.fullSampleSetInfo.createStarted = 0;
    mu.fullSampleSetInfo.createEnded = 0;
    mu.fullSampleSetInfo.secsToCreate = 0;
    mu.fullSampleSetInfo.log = "";
    mu.fullSampleSetInfo.aSampleInfo = [];
}
function reset_globals() {
    hits = {};
    orig_hits = {};
    pop_info = {};
    names = [];
    pts_merged = {};
    g.num_pops = 0;
    sample_pts_trimmed = {}; // 10May2016 each sample has .left and .right arrays to show any pt trimmed when having too few reads to support it
    initPrimerMinMax(); // 10May2016
}

function muServerVersion() {
    var version = "no version info";
    $.ajax({
        type: "GET", url: '/version', dataType: "text",
        async: false,
        success: function (data) {
            version = data
        }
    });

    return version;
}

let saveServer = () => {} // place holder function
let checkIsFile = () => (true) // always return true
let handleAjaxError = () => {} // no op function

// 30Jun2017 begin loading just data for mu and not function objects
// just save data objects, not function objects
function muSaveData() {
    var muData = {}, muStr, filename;
    muData.projectDirectory = mu.projectDirectory; // not considered data object, we'll save it but not load it

    for (var obj in mu) {
        if (mu.hasOwnProperty(obj) && isSaveObject(obj, mu[obj])) {
            if (typeof mu[obj] === "object") {
                muData[obj] = (Array.isArray(mu[obj])) ? [] : {};
                $.extend(true, muData[obj], mu[obj]);
            }
            else
                muData[obj] = mu[obj];
        }
    }
    muStr = JSON.stringify(muData);
    filename = mu.projectDirectory + g.muInfoFile;
    saveServer(filename, muStr);
}

function muLoadData() {
    var fullMu = {};
    var muinfoFile = mu.projectDirectory + "/" + g.muInfoFile;
    reset_mu_data();

    if (!checkIsFile(muinfoFile)) // don't bother loading non-existent it just creates errors
        return;


    $.ajax({
        type: "GET",
        url: '/get_file',
        data: {
            "file": muinfoFile

        },
        dataType: "text",
        error: handleAjaxError,
        success: function (data) {
            if (data && data !== "" && data[0] === "{") {

                fullMu = JSON.parse(data);
                muCopyDataObjects(fullMu); // copy data objects in fullMu to mu
            }
            else {
                reset_mu();
            }
        },
        async: false
    });
}

function isSaveObject(obj_name, object) {
    var exclude = ["STEPS", "projectDirectory", "flow", "explore", "main"];

    if (exclude.indexOf(obj_name) !== -1)
        return false;

    return !isFunctionObject(object);

    function isFunctionObject(data_var) { // check obj to see if any top-level members are of type "function"
        if (typeof data_var === "object") {
            for (var prop in data_var) {
                if (data_var.hasOwnProperty(prop) && typeof data_var[prop] === "function")
                    return true;
            }
        }
        return false;
    }
}
function muCopyDataObjects(fullMu) {
    for (var obj in fullMu) {
        if (fullMu.hasOwnProperty(obj) && isSaveObject(obj, mu[obj])) {
            if (Array.isArray(fullMu[obj]) || typeof fullMu[obj] === "object") {
                if (Array.isArray(fullMu[obj]))
                    mu[obj] = [];
                else
                    mu[obj] = {};
                $.extend(true, mu[obj], fullMu[obj]);
            }
            else
                mu[obj] = fullMu[obj]; // for numbers, strings, booleans
        }
    }
}

// export variables which become const when imported
export {g, hits, orig_hits, names, mu, sample_pts_trimmed, pop_info, pts_merged}

// export functions
export {initPrimerMinMax}