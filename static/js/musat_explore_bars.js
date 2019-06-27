"use strict";

function ExploreBars() {
    //  for allowing makeNthPlot able to call itself with a timer
    var nth_plot, $poptitle, sampnum, popnum, bgtime, curpop; // name of current Population
    var in_plotting_mode = false; // 21May2016 JBH
    var curfile;

    function show() {
        mu.explore.setupSidebars('#explore_bars', clicked);
        mu.explore.hiliteCurLocus(primer_nm);
        clicked()
    }

    function clicked(event) {
        var curLocus

        if (event != null) {
            curLocus = event.data;
            primer_nm = curLocus;
        }
        else {
            curLocus = primer_nm;
        }
        if (curLocus === undefined)
            return;

        reset_globals();
        initPlotting();
        mu.explore.hiliteCurLocus(curLocus);
        // load allele file into "data", the verbatim contents of the <curLocus>_AlleleLens.txt file
        var data = getAlleleLenFile(curLocus);
        var ary = data.split("\n");
        var line1 = ary[0], line2 = ary[1];
        if (ValidFile(line1, line2)) { // look at first 2 lines of file and see if they look reasonable
            $("#plots").empty();
            setFileForBarPlot(getAlleleLenFilename(curLocus), curLocus); // sets 2 vars in bar plot object
            processData(ary);
            displayProcessedData();
            $("html,body").scrollTop(0);
        } else {
            // TODO: better Error handling
            alert("File invalid.\n\nFilename:\n" + getAlleleLenFilename(curLocus) + "\n\nFirst 2 lines of file:\n" + line1 + "\n" + line2);
        }
    }

    this.show = show;
}