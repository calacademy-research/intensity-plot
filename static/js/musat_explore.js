function Explore(workingDirectory) {
    var javascripts = [];
    var selectedDirectory;

    var that = this;

    function setup(workingDirectory) {
        this.selectedDirectory = workingDirectory;
        javascripts.bars = new ExploreBars();
        javascripts.scatter = new ExploreScatter();
    }


    function show(viewName) {
        updateIndicator();
        if (viewName === "default")
            showDefaultView();
        else if (viewName in javascripts) {
            setDefaultView(viewName);
            javascripts[viewName].show();
        }
    }

    this.show = show;

    function updateIndicator() {
        $("#all_loci_called").html( (allLociCalled() ? '&#10003;' : '&nbsp;') );
    }
    this.updateIndicator = updateIndicator;


    function setupSidebars(parent, callback) { // there are 2 copies so need parent id to find which one we setup
        var row, $tbl = $(parent).find("#primers_contents").empty(); // id of tbody

        // Iterate over mu.primerJSON[].['Locus Name']
        for (var i = 0; i < mu.primerJSON.length; i++) {
            var data = mu.primerJSON[i];
            var curLocus = data["Locus Name"];

            row = "<tr><td id='" + curLocus + "' class='primer plotPrimer'>" + curLocus + "</td>";
            row += "<td id='" + curLocus + "_count' class='calledCol'></td></tr>";
            $tbl.append(row);
            $tbl.find("#" + curLocus).click(curLocus, callback);

            updateAlleleCountsDisplay($tbl, curLocus, false);
        }
    }

    function showDefaultView() {
        var defaultView = mu.callAlleleDefaultView;
        if ( ! defaultView in javascripts)
            setDefaultView();

        $(".tab-content .tab-pane").removeClass("active");
        $("#"+defaultView+"-pane").addClass("active");

        $("#menu_1_handle").removeClass("active"); //we should clear more but this is likely where we were
        $("#menu_2_handle").addClass("active");

        show(defaultView);
    }
    this.showDefaultView = showDefaultView;
    setDefaultView = function(viewName) {
        mu.callAlleleDefaultView = (viewName in javascripts) ? viewName : "bars";
    };

    this.setupSidebars = setupSidebars;

    this.hiliteCurLocus = function(curLocus) {
        $('.plotPrimer').removeClass('cur_primer processing');
        if (curLocus) {
            $('#' + curLocus + '.plotPrimer').addClass('cur_primer');
            primer_nm = curLocus;
        }
    };

    setup(workingDirectory);
}