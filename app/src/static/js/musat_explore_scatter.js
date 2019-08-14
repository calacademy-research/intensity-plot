function ExploreScatter() {
    // Hit when we click a particular locus on the sidebar
    function clicked(event) {
        var curLocus = event.data;
        showLocus(curLocus);
    }

    function showLocus(curLocus) {
        mu.explore.hiliteCurLocus(curLocus);
        setupGridGraph(curLocus);
    }

    // Hit when we open the "grid graph" tab
    function show() { // if showCurLocus, show what bar plot is showing
        mu.explore.setupSidebars('#explore_scatter', clicked);

        var locus = (primer_nm && primer_nm!=="") ? primer_nm : $('#scatter_cur_locus').text();
        mu.explore.hiliteCurLocus(locus);

        if (locus !== "")
            showLocus(locus);
    }

    this.show = show;
}