import $ from "jquery"
import {muLoadData} from "./musat_global"

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
function muExportAlleleCalls() {
    var json_payload = {};
    // needs to be in the project_directory


    json_payload['filename'] = mu.projectDirectory + "/cur_locuscalls";
    json_payload['calls'] = JSON.stringify(mu.oLocusCalls, null, ' ');
    json_payload['working_directory'] = mu.projectDirectory;


    $.ajax({
        type: "POST",
        url: "/save_calls",
        data: json_payload,
        error: function (jqXHR, textStatus, errorThrown) {
            alert(textStatus + "\n" + errorThrown);
        }
    });
}

function muClearAlleleCalls() {
    // var globallyCalledAlleles = mu.oLocusCalls[primerName];
    for (var locusName in mu.oLocusCalls) {
        for (var sampleName in mu.oLocusCalls[locusName]) {
            mu.oLocusCalls[locusName][sampleName] = null;

        }
    }

    redrawCalls();
}

function muLoadAlleleCalls() {
    // var globallyCalledAlleles = mu.oLocusCalls[primerName];
    muLoadData();

    redrawCalls();
}

function muRemoveAlleleLockouts() {
    $.ajax({
        type: "GET",
        url: '/remove_locked_out_alleles',
        data: {
            'filename': mu.projectDirectory + "/cur_locuscalls",
            'working_directory': mu.projectDirectory,
            'calls': JSON.stringify(mu.oLocusCalls, null, ' ')
        },
        async: false,
        success: function (data) {
            loadedCalls = JSON.parse(data);
        },
        error: function (data) {
            alert("Failed to load cur_locuscalls");
        }
    });
    mu.oLocusCalls = loadedCalls;
    redrawCalls();
}

// destination of "calls" button from front page

function muGenerateAlleleCalls() {

    $.ajax({
        type: "GET",
        url: '/automatic_calls',
        data: {
            'working_directory': mu.projectDirectory
        },
        async: false,
        success: function (data) {
            loadedCalls = JSON.parse(data);
        },
        error: function (data) {
            alert("Failed to load cur_locuscalls");
        }
    });

    mu.oLocusCalls = loadedCalls;
    redrawCalls();

}

// load calls button on the graphs
function muImportAlleleCalls() {
    var loadedCalls;


    $.ajax({
        type: "GET",
        url: '/load_calls',
        data: {
            'filename': mu.projectDirectory + "/cur_locuscalls",
            'working_directory': mu.projectDirectory,
            'calls': JSON.stringify(mu.oLocusCalls, null, ' ')
        },
        async: false,
        success: function (data) {
            loadedCalls = JSON.parse(data);
        },
        error: function (data) {
            alert("Failed to load cur_locuscalls");
        }
    });
    mu.oLocusCalls = loadedCalls;
    redrawCalls();


}

function redrawCalls() {
    for (var locusName in mu.oLocusCalls) {
        clearAlleleCounts(locusName);
    }
    clearShowingAlleles();
    mu.explore.show();
}



function clearAlleleCounts(locusName) {

    updateAlleleCountsDisplay('#explore_scatter', locusName, true);
    updateAlleleCountsDisplay('#explore_bars', locusName, true);

}

function clearShowingAlleles() {

    if ($("#bars-pane").is(":visible") === true) {
        $("#plots").empty();
        mu.explore.show('bars');

    }

    if ($("#scatter-pane").is(":visible") === true) {
        mu.explore.show('scatter');

    }

}

export default muExportAlleleCalls