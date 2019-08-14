//TODO: have the "cancel" click cancel the running process on the server. 

var spinner;
// run a script or program in the bin directory of the webserver
function runpgm(binName, successfunc, failfunc, withPopup) {
    if (withPopup === true) {
        showRun(binName);
        binName += ",printing=true";
    }
    console.log("Running program with args: " + binName);
    $.ajax({
        type: "GET",
        url: binName,
        dataType: "text",
        error: function (jqXHR, textStatus, errorThrown) {
            doneWithCall(false, errorThrown);
            if (!failfunc)
                handleAjaxError(jqXHR, textStatus, errorThrown);
            else
                failfunc(jqXHR, textStatus, errorThrown);

        },
        success: function (data) {
            doneWithCall(true, data);
            successfunc(data);
        },
    });
}

function getUrl(url, successfunc) {
    showRun(url.replace(/^\//, ""));
    $.ajax({
        type: "GET",
        url: url,
        dataType: "text",
        success: function (data) {
            doneWithCall(true, data);
            successfunc(data);
        },
        error: function () {
            doneWithCall(false, undefined);
            handleAjaxError();
        }
    });

}

function getUrlWithData(url,payload, successfunc) {
    showRun(url.replace(/^\//, ""));
    $.ajax({
        type: "GET",
        url: url,
        data: payload,
        dataType: "text",
        success: function (data) {
            doneWithCall(true, data);
            successfunc(data);
        },
        error: function () {
            doneWithCall(false, undefined);
            handleAjaxError();
        }
    });

}

function postUrl(url, payload, successfunc) {
    showRun(url.replace(/^\//, ""));
    $.ajax({
        type: "POST",
        url: url,
        data: payload,
        success: function (data) {
            doneWithCall(true, data);
            if (successfunc) {
                successfunc(data);
            }
        },
        error: function () {
            doneWithCall(false, undefined);
            handleAjaxError();
        }
    });

}

function doSpin(elementId) {
    var opts = {
        lines: 30 // The number of lines to draw
        , length: 28 // The length of each line
        , width: 5 // The line thickness
        , radius: 48 // The radius of the inner circle
        , scale: 1 //4 // Scales overall size of the spinner
        , corners: 1 // Corner roundness (0..1)
        , color: '#000' // #rgb or #rrggbb or array of colors
        , opacity: 0 // Opacity of the lines
        , rotate: 0 // The rotation offset
        , direction: 1 // 1: clockwise, -1: counterclockwise
        , speed: 0.3 // Rounds per second
        , trail: 40 // Afterglow percentage
        , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
        , zIndex: 2e9 // The z-index (defaults to 2000000000)
        , className: 'spinner' // The CSS class to assign to the spinner
        , top: '50%' // Top position relative to parent
        , left: '50%' // Left position relative to parent
        , shadow: false // Whether to render a shadow
        , hwaccel: false // Whether to use hardware acceleration
        , position: 'fixed' // Element positioning
    };
    var target;
    if (elementId) {
        target = document.getElementById(elementId);
    } else {
        target = document.getElementById('run_progress');

    }
    spinner = new Spinner(opts).spin(target);
}

function stopSpin() {
    if (spinner) {
        spinner.stop();
    }
}

function doneWithCall(succeeded, data) {
    stopSpin();
}

function closeRun() {
    clearRun();
    $("#run_progress").css("visibility", "hidden").css("opacity", "0");

}

function clearRun() {
    $("#run_progress_content").empty();
}

// at least some way that iterating process can check to see if the user initiated
// a close of the run_progress box. better way would probably be for the
// creator of the run to pass in callbacks for completed and cancelled
// or a single callback that's passed boolean in to indicate success or cancel, etc.
function isRunClosed() {
    return "hidden"===$("#run_progress").css("visibility")  &&  ""===$("#run_progress_content").text();
}

function showRun(runString) {
    // set options to show run or do spinny.
    var $run_progress = $("#run_progress");
    var $run_progress_content = $("#run_progress_content");

    if (runString.indexOf('?') >= 0) {
        $run_progress_content.append("Arguments:<br>");
        binaryName = runString.split('?')[0];
        argsArray = runString.split('?')[1].split('=')[1];
        if (argsArray.indexOf(' ') >= 0) {
            argsArray = argsArray.split(' ');
            for (var i = 0; i < argsArray.length; i++) {
                $run_progress_content.append("argument : " + (i + 1) + ":" + argsArray[i] + "<br>");
            }
        } else {
            $run_progress_content.append("&nbsp;&nbsp;&nbsp;<em>" + argsArray + "</em><br>");
        }
        $run_progress_content.append("<br><br>")
    } else {
        binaryName = runString;
    }

    $("#run_progress_header").text("Running " + binaryName);
    $run_progress.css("visibility", "visible").css("opacity", "1");

    // scroll to bottom
    var height = $run_progress[0].scrollHeight;
    $run_progress.scrollTop(height);
    doSpin();
}

// use the same modal html to show the Log from a prior run
function showRunLog(hdr, log) {
    $("#run_progress_header").html(hdr);
    $("#run_progress_content").text(log);
    $("#run_progress").css("visibility", "visible").css("opacity", "1");
}

function showObjRunLog(title, stepobj) { // stepobj must have a few known properties defined
    if (stepobj) {
        var hdr = title;
        var log = stepobj.log ? stepobj.log : "";

        if (log==="") log = "Not run yet";

        if (stepobj.createEnded && stepobj.secsToCreate) {
            var dtstr = new Date(stepobj.createEnded).toLocaleString();
            hdr += " " + dtstr + " took " + fmtMSS(stepobj.secsToCreate);
        }

        showRunLog(hdr, log);
    }
}

// function runOnServer() {
//     var options = {};
//     options.transports = ['websocket'];
//
//     var socket = io.connect('http://' + document.domain + ':' + location.port, options);
//     // var socket = io.connect('http://' + document.domain + ':' + location.port);
//
//     socket.on('connect', function () {
//         console.log("Connected to socket server");
//         // socket.emit('my event', {data: 'I\'m connected!'});
//     });
//     //websocket
//     // socket.on('disconnect', function() {
//     //     console.log("Socket disconnected.");
//     //     socket.reconnect();
//     // });
//     socket.on('run_log', function (string) {
//         console.log(string);
//         $("#run_progress_content").append(string + "<br>");
//     });
// }


function runOnServer() {
    var socket = io.connect('http://' + document.domain + ':' + location.port,
        {rememberTransport: false});
    // socket.on('connect', function () {
    //     socket.emit('my event', {data: 'I\'m connected!'});
    // });


    // 05Jul2017 run_progress_content div has class whitespace: pre-wrap
    // so we don't need to add the <br>.
    socket.on('run_log', function (string) {
        console.log(string);
        $("#run_progress_content").append(string /* + "<br>" */);

        //var $scrollTarget = $("#run_progress"); //.parent(); neither worked
        //$scrollTarget.scrollTop($scrollTarget.height()); // this isn't working
    });
}

runOnServer();

