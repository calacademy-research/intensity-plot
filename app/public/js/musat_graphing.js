//
// Used to support "Call Alleles" tab
// Data only support is in process_graph_data
// This file handles bar graphs.
//
"use strict";

var timer = new Date();
var nth_plot, $poptitle, sampnum, popnum, bgtime, curpop; // name of current Population
var in_plotting_mode = false; // 21May2016 JBH
function initPlotting() {
    sampnum = 0;
    popnum = 0;
    nth_plot = 0;
    curpop = "";
    timer = new Date();
    bgtime = timer.getTime();
    in_plotting_mode = true; // 21May2016 JBH
}


function onNextPop(evt) {
    var $cur_pop = $(evt.target).closest("div");
    var nxt_pop = $cur_pop.nextAll(".Pop").first()[0]; // [0] since we need a true DOM object not wrapped in jquery object
    nxt_pop.scrollIntoView();
}

function onPrevPop(evt) {
    var $cur_pop = $(evt.target).closest("div");
    var prv_pop = $cur_pop.prevAll(".Pop").first()[0]; // [0] since we need a true DOM object not wrapped in jquery object
    prv_pop.scrollIntoView();
}


function setFileForBarPlot(fname, curLocus) { // 30Jun2016 same id is unfortunately used for primers in Call Alleles and Grid Graph, differ by class name
    curfile = fname;
    primer_nm = curLocus;
}



var nth_sample; // global for routine to increment and then call itself
function callLoci() { // use heuristics to set 1 or 2 loci on samples that haven't had a peak called
    nth_sample = 0;
    timer = new Date();
    bgtime = timer.getTime() - 1000; // subtract a second to force initial msg
    callNthSample()
}

function fin_callLoci() {
    $("#call_btn").removeClass("disable");
    $("#" + primer_nm + " .plotPrimer").removeClass("processing"); // make name blue after processing
    setCalled();
    $("#msg").empty();
}

function callNthSample() { // calls callSample, increments global nth_sample and calls itself
    if (nth_sample < names.length) {
        callSample(names[nth_sample]);
        nth_sample++;
        var timer = new Date(), now = timer.getTime(), tm = now - bgtime;
        if (tm > 500) { // give UI a chance to update
            bgtime = now;
            var nm = (nth_sample > 1) ? " " + nth_sample.toString() : "s";
            $("#msg").html("Calling Allele Loci in uncalled Plot" + nm + "...");
            setTimeout(function () {
                callNthSample();
            }, 100);

        } else {
            callNthSample();
        }
    }
    else
        fin_callLoci();
}

function callSample(sample, alwaysCall) { // if alwaysCall is false, only set peaks if none set already
    var plot = $('#' + sample + ".chart").data('plot');
    if (!plot)
        return false;
    var peaks = plot.series[1].data;
    var pts = plot.series[0].data;
    if (pts.length === 0)
        return false;
    if (peaks.length === 0 || alwaysCall) {
        // plot.series[1].data = peaksFromPts(pts);
        // plot.series[1].data = [];
        plot.replot({resetAxes: false});
        showInfo(sample, plot.series[1].data);
    }
    mu_setOLocusCallsFromSampleGraph(primer_nm,sample, plot.series[1].data); // 20May2016 JBH set array of called pts for sample (adding objects in mu global as necessary)
    return plot.series[1].data.length > 0
}

function showInfo(id, peak_data, addtl) { // id element is expected to have a succeeding sibling with .sampinfo class
    var info = "";
    var pd_len = peak_data ? peak_data.length : 0;
    if (pd_len > 0)
        info = "allele len ";
    for (var p = 0; p < pd_len; p++) {
        var pt = peak_data[p];
        info += pt[0].toString() + "nt ";
    }
    if (addtl)
        info += addtl;
    else if (id in pts_merged)
        info += " &nbsp;&nbsp;<span class='mrgd'>(" + pts_merged[id] + ")</span>"
    else if (id in sample_pts_trimmed) {// 10May2016 JBH show clipped point on info line
        var trimstr = trimmedPtsStr(id)
        if (trimstr.length > 0) {
            info += " &nbsp;&nbsp;<span class='trimmed_pt'>trimmed " + trimstr + "</span>"
        }
    }

    //$("#" + id).next(".sampinfo").html(info);
    $("#" + id + ".chart").next(".sampinfo").html(info); // need make sure it is our id

    function trimmedPtsStr(id) {
        var str = ""
        var ptsLft = sample_pts_trimmed[id].left;
        var ptsRt = sample_pts_trimmed[id].right;
        for (p in ptsLft) {
            str += toStr(ptsLft[p]) + " &nbsp;"
        }
        for (p in ptsRt) {
            str += toStr(ptsRt[p]) + " &nbsp;"
        }
        return str
    }

    function toStr(pt) {
        return pt[0].toString() + "," + pt[1].toString()
    }
}

function makePlots() {
    $("#plots").empty();
    var style = "style1"; // 03Feb2016 stop allowing 2col for now//var style = $("#2col").prop('checked') ? "style2" : "style1"
    var pop_x_scale = false; // 02May2016 JBH was: true; //$("#sameX").prop('checked')
    initPlotting(); // reset nth_plot and other variables for plotting
    makeNthPlot(style, pop_x_scale) // this will call itself, incrementing global nth_plot
}

function finPlotting() {
    in_plotting_mode = false; // 21May2016 JBH
}
function makeNthPlot(style, pop_x_scale) {
    var nth = nth_plot;
    if (nth < names.length) {
        var pop = popName(names[nth]);
        if (pop !== curpop) {
            if (curpop !== "")
                updateSampnum($poptitle, sampnum, popnum);
            $poptitle = $("<div class='Pop' id='" + pop + "'><span class='PopTitle'>" + pop + " <span class='sampnum'></span></span></div>").appendTo($("#plots"));
            curpop = pop;
            sampnum = 0;
            popnum++;
        }
        sampnum++;
        makePlot("#" + curpop, names[nth], nth + 1, style, pop_x_scale);

        nth_plot++;
        var timer = new Date(), now = timer.getTime(), tm = now - bgtime;
        if (tm > 1000 || nth_plot === 2) { // give UI a chance to update
            bgtime = now;
            $("#msg").html("Creating Plot " + nth_plot.toString() + "...");
            setTimeout(function () {
                makeNthPlot(style, pop_x_scale);
            }, 100);
        } else
            makeNthPlot(style, pop_x_scale);
    } else { // all done with this file's plots, update various items with the values
        updateSampnum($poptitle, sampnum, popnum);
        $("<br/>").appendTo($("#plots")); // 14May2016 JBH
        $("#msg").html("");
        finPlotting(); // 21May2016 JBH
        // if (callOnLoad())
        setCalled();
        // else
        //     $("#" + primer_nm).removeClass("processing");
    }

    function updateSampnum($poptitle, sampnum, popnum) {
        if ($poptitle) $poptitle.find(".sampnum").html(sampnum.toString() + " Samples &nbsp;&nbsp;" + arwSpan(popnum))
    }

    function arwSpan(popnum) {
        var prvclass = (popnum === 1) ? "class='disable'" : "class='popnav' onclick='onPrevPop(event)'";
        var nxtclass = (popnum >= (num_pops)) ? "class='disable'" : "class='popnav' onclick='onNextPop(event)'";
        var nxt = "<span " + nxtclass + ">&#9660;next&nbsp;</span>", prv = "<span " + prvclass + ">&#9650;previous</span>";
        return "<span class='arrows'>" + nxt + prv + "</span>";
    }
}

function makePlot(parent_id, sample, n, style, pop_x_scale) {
    $(parent_id).append("<div class='chart " + style + "' id='" + sample + "'></div><span class='sampinfo'></span>");
    var plot = drawPlot(sample, n, pop_x_scale);
    if (plot && plot.series[1]) {
        showInfo(sample, plot.series[1].data);
    } else {
        var $sampleID = $("#" + sample);
        $sampleID.append("<br/><br/><br/><div class='missingplot'>(" + n.toString() + ") Sample <b>" + sample + "</b> not plotted. No chartable points.</div><br/><br/>")
    }
}

function drawPlot(sample, n, pop_x_scale) { // passed in name of a sample
    var info = hits[sample]; // array each entry consisting of #reads and the musat length they represent
    if (info.length === 0) { // 15May2016 JBH we might have deleted all the points during refine_xaxis()
        return null;
    }


    info.sort();
    var do_smoothing = true;
    var len_min = info[0][0] - 1;
    var len_max = info[info.length - 1][0] + 1;
    if (pop_x_scale) { // force samples in same population to use the same x-scale
        var inf = pop_info[popName(sample)];
        len_min = inf.min_len;
        len_max = inf.max_len;
    }
    else { // 02May2016 JBH use min and max of entire allele len file // 14May2016 now that we refine the clipping let's give +1 breathing room
        len_max = primer_max + 1;
        len_min = primer_min - 1
    }
    var x_numticks, y_numticks; // leave undefined in cases where there is a large distance between lengths
    if (len_max - len_min <= 51)
        x_numticks = len_max - len_min + 1;

    var num_rd_counts = numUniqueReadCounts(info);
    if (num_rd_counts < 2) {
        y_numticks = num_rd_counts + 2
    }


    if (!mu.oLocusCalls[primer_nm]) {
        mu.oLocusCalls[primer_nm] = {};
    }
    var calledPts = mu.oLocusCalls[primer_nm][sample] || [];

    var sample_id = sample + ".chart"; // we are having conflicts with the simple sample ID add its chart class
    var plot = $.jqplot(sample_id, [info, calledPts], {
        title: "<br/>(" + n.toString() + ") " + sample + "",
        axesDefaults: {
            labelRenderer: $.jqplot.CanvasAxisLabelRenderer // allow axis rotated text
        },
        captureRightClick: true,
        seriesDefaults: {
            rendererOptions: {smooth: do_smoothing}
        },
        // Series options are specified as an array of objects, one object for each series.
        series: [
            {
                renderer: $.jqplot.BarRenderer, // 19May2016 JBH start bar usage in lieu of line
                rendererOptions: {barWidth: 6, shadowDepth: 3, shadowAlpha: 0.05, formatString: " %d"},
                markerOptions: {show: false, style: "circle"}, // was filledCircle
                pointLabels: {show: true, formatString: "%d", hideZeros: false} // hideZeros has problems when toggling a point next to an undisplayed zero
            },
            { // series2 used to indicate chosen musat point
                showLine: false, // Don't show a line, just show markers.
                markerOptions: {size: 9, style: "filledCircle", color: 'blue'}
            }
        ],
        // Allowable axes are xaxis, x2axis, yaxis, y2axis, y3axis, ... (Up to 9 y axes are supported.)
        axes: {
            xaxis: {
                label: "μ sat length", // "μ" mu can be shown in utf-8
                //pad: 0,
                min: len_min,
                max: len_max,
                tickOptions: {formatString: "%d"},
                numberTicks: x_numticks
            },
            yaxis: {
                label: "# Reads",
                min: 0,
                numberTicks: y_numticks,
            }
        },
        highlighter: {show: true, sizeAdjust: 4.5},
        cursor: {show: false}
    });

    var $sample = $('#' + sample_id); //+ sample);
    $sample.data('plot', plot);
    $sample.unbind('jqplotDataClick'); // 19May2016 try to fix dbl event trigger when bars used
    // TODO: Existing bug; looks like this gets hit twice.
    $sample.bind('jqplotDataClick', function (ev, seriesIndex, pointIndex, data) {
            toggleLocusSelection(ev, seriesIndex, pointIndex, data)
        }
    );
    $sample.bind('jqplotDataRightClick', function (ev, seriesIndex, pointIndex, data) {
            deletePt(ev, seriesIndex, pointIndex, data)
            // restoreOrig(ev, seriesIndex, pointIndex, data)
        }
    );

    return plot;

    // event handlers for the various clicks (closure keeps info and plot around for each sample)
    function deletePt(ev, seriesIndex, pointIndex, data) {
        if (info.length > 1 && confirm("Delete [" + data + "]?")) {
            if (!(sample in orig_hits))
                orig_hits[sample] = info.slice(0); // make a copy of the series info in case we want to restore it
            info.splice(pointIndex, 1); // delete the point data from the array
            plot.series[0].data = info;
            plot.replot({resetAxes: ['xaxis']}) // resetAxes can take boolean or array of axes names
        }
    }


    function toggleLocusSelection(ev, seriesIndex, pointIndex, data) {
        ev.stopImmediatePropagation();
        var timer = new Date(), now = timer.getTime(), milli = now - bgtime; // kludge to work around multiple successive calls on a click
        if (milli < 150) // i'm getting numbers like 47,36, 32 milli in debugger
            return;
        bgtime = now;

        if (seriesIndex > 1)
            return;

        var allele_index = inSeries2(data[0]); // 19May2016 new method, -1 for not in there
        if (allele_index < 0) // -1 means it is not in series 2 data array
            plot.series[1].data.push(data); // use 2nd series for indicating chosen musat locus
        else { // deleting the chosen point
            if (plot.series[1].data.length === 1) // 23May2016 deleting last of the 2nd series pts
                plot.series[1].data = [];
            else // delete the appropriate point
                plot.series[1].data.splice(allele_index, 1)
        }

        mu_setOLocusCallsFromSampleGraph(primer_nm,sample, plot.series[1].data);

        plot.replot({resetAxes: false});
        showInfo(sample, plot.series[1].data);
        setCalled();

        function inSeries2(len) {
            var alleles = plot.series[1].data.length;
            for (var i = 0; i < alleles; i++) {
                var l = plot.series[1].data[i][0];
                if (l === len)
                    return i
            }
            return -1
        }
    }
}

function numUniqueReadCounts(info_ary) // return number of unique items in an info array where each element contains [len, #reads]
{
    var n = {}, num_distinct_rd_counts = 0;
    for (var i = 0; i < info_ary.length; i++) {
        var rd_count = info_ary[i][1]; // count of reads is in [1]
        if (!n[rd_count]) {
            n[rd_count] = true;
            num_distinct_rd_counts++
        }
    }
    return num_distinct_rd_counts
}



function setCalled() { // set indicator for curfile's primer_nm as to whether called and how many samples called
    updateAlleleCountsDisplay('#explore_bars', primer_nm, true);
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

function clearCalledIndicator(parent, curPrimerName) {

    var $callCol = $(parent).find("#" + curPrimerName + " .calledCol");
    if ($callCol.length === 0) // we might have changed to table format
        $callCol = $(parent).find("#" + curPrimerName).siblings(".calledCol");

    $callCol.empty();
}

function displayProcessedData() {
    gr_injectHtml();
    setTimeout(makePlots, 50) // give UI thread a chance to update
}

function gr_injectHtml() {
    var cmds = "<br/>";
    cmds += "Click a reads-count bar to toggle it as allele locus.&nbsp;";
    var filepart = curfile.split('\\').pop().split('/').pop();
    //cmds +='<input id="sameX" type="checkbox"><span>Same x-axis scale within a Population</span></input>'

    var vwbtn = '<a href="#scatter-pane" data-toggle="tab" onclick="mu.explore.show(\'scatter\')">' +
        '<button id="gr_switch_view" class="btn navbar-right">Switch to Intensity Plot View</button></a>';

    var cap = "<div>" + primer_nm + " &nbsp;Microsatellite Distributions for " + (names.length).toString() + " samples from " + num_pops.toString() + " populations" +// in " + filepart +
        vwbtn + "</div><div><span id='msg'>Creating Plots...</span> &nbsp;<span class='cmds'>" + cmds + "</span></div>";
    $("#gr_caption").html(cap);
    $("#" + primer_nm).addClass("processing") // make name red and italic while processing
}

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




// setter utility function to add new called points to the set of called alleles.
// implementations that require a locus name, aka primer name, as first arg
// (gr_ versions above use currently loaded locus file from var primer_nm)



// 20May2016 JBH set array of called pts for sample (adding objects in mu global as necessary)

function mu_setOLocusCallsFromSampleGraph(primerName, sampleName, calledPoints) {
    if (!(primerName in mu.oLocusCalls)) {
        mu.oLocusCalls[primerName] = {}; // locus file's primer name object will have properties with sampleName names
    }
    if (!(sampleName in mu.oLocusCalls[primerName])) {
        mu.oLocusCalls[primerName][sampleName] = [];
        if (-1 === $.inArray(sampleName, mu.aSampleName)) { // sampleName not seen before, add it to array
            mu.aSampleName.push(sampleName);
            mu.aSampleName.sort(sortByPopThenSample);
        }
    }
    if (calledPoints != null && calledPoints.length > 0)
        mu.oLocusCalls[primerName][sampleName] = $.extend(true, [], calledPoints); // need deep copy // calledPoints.slice(0) // make mu's own copy of this
    else
        mu.oLocusCalls[primerName][sampleName] = []
}







