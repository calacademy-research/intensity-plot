// Results table showing calls for all samples in all Locus Files made so far -- 19May2016 JBH
// Export options are also to be implemented here

function Results_obj() { // newed object created by musat_flow.js setup()

    this.show = function () {
        $(".results_div").hide();
        prepSampleNames(); // move to aSampleNames from names array that scatter is using  (hopefully this is short-lived)

        if (numLocusNames() === 0 || mu.aSampleName.length === 0) { // todo: use system warning mechanism
            $("#no_alleles_called").show();
            return;
        }

        initResultsInfo();
        muSaveData();

        $('#rs_stat_pane').empty();

        replaceCaption();
        $("#call_results").show();
        $("#results_tbl").html(bldResultTbl()); // rebuild it every time so display in accord with current Called Alleles

        addPopNameTooltips(); // also adds click handler for Sample name cell
        setExcludedSamplesAndLoci();

        function replaceCaption() {
            $("#results_caption").html("<h2>Results of Called Alleles for the Samples</h2>").addClass("offset");
        }
    };


    function bldResultTbl() {
        // new calls might have been made or additional samples might have results in new file -- recreate the entire table.

        var tbl_txt = tblHdr(), num_loci = numLocusNames(), num_samples = mu.aSampleName.length;
        var curPopName = "", curPopNum = 0, right_align = false; // right-align sample name or not depending on this
        var samp_cls = right_align ? "right-align" : "";

        for (var s = 0; s < num_samples; s++) { // for each sample
            var samp = mu.aSampleName[s], lf_shown = 0;
            chkPopName(samp);
            var grp_samp_cls = samp_cls + (((curPopNum) % 2) ? " odd_group" : " even_group");
            var row = "<tr><td id='report_sample_name_" + samp + "' class='" + grp_samp_cls + " report_sample_col'>" + samp + "</td>";
            for (var lf = 0; lf < num_loci; lf++) { // fill in the alleles called for each of the loci
                var locus_nm = getLocusName(lf);
                var locus_calls = mu.oLocusCalls[locus_nm];
                if (locus_calls) {
                    var cls = (lf_shown++ % 2) ? "odd_col" : "even_col";
                    cls += " rpt_locus_" + locus_nm; // designate locus with which these cols are associated
                    row += callsToCols(locus_calls[samp], cls) // for this sample in this locus file, this is an array of pts called for the sample
                }
            }
            tbl_txt += row + "</tr>"
        }
        return tbl_txt;

        // make header where first column is Sample Name and second column is
        // 2 columns per called locus (e.g. 25 locus files, 50 columns for these)
        function tblHdr() {
            var num_called_loci = 0; // lf_str() sets this to the correct value
            var num_samples = mu.aSampleName.length, num_locusFileNames = numLocusNames();
            return "<tr><th id='blankcol'>" + parseInt(num_samples) + " samples</th>" + lf_str() + "</tr>" +
                "<tr><th>&nbsp;&nbsp;Sample&nbsp;Name&nbsp;&nbsp;</th>" + "<th>&#945;</th><th>&#946;</th>".repeat(num_called_loci) + "</tr>";

            function lf_str() {
                var str = "";
                for (var lf_ix = 0; lf_ix < num_locusFileNames; lf_ix++) {
                    var nm = getLocusName(lf_ix);
                    var locusCalls = mu.oLocusCalls[nm];
                    if (locusCalls) { // if locusCalls object defined put a header in for it
                        num_called_loci++;
                        var clkfnc = 'mu.oResults.showLocusNameStats("' + nm + '")';
                        var clkfnc2 = 'mu.oResults.toggleLocusExclusion(event,"' + nm + '")';
                        var spantxt = padSpanTxt("&#x2610;");
                        var excludeSpan = "<span class='report_exclude_locus_span' onclick='" + clkfnc2 + "'>" + spantxt + "</span>";  // &#x2612; for box with x in it
                        str += "<th id='report_locus_name_" + nm + "' colspan=2 class='locus_name'><button class='btn' onclick='" + clkfnc + "'>" +
                            nm + "</button>" + excludeSpan + "</th>"; // locus name, spans two table cols
                    }
                }
                return str
            }
        } // tblHdr()

        function chkPopName(sample) {
            var pop = popName(sample);
            if (pop !== curPopName) {
                curPopName = pop;
                curPopNum++
            }
        }

        function callsToCols(aPts, cls) { // always return 2 columns worth of data
            var cols, numPts = aPts ? aPts.length : 0;

            if (aPts)
                aPts.sort(); // sort by mulen

            var td = cls ? "<td class='" + cls + "'>" : "<td>";
            if (numPts > 0) {
                cols = td + aPts[0][0] + "</td>";
                if (numPts > 1)
                    cols += td + aPts[1][0] + "</td>";
                else
                    cols += td + "<span class='same_allele'>" + aPts[0][0] + "</span></td>" // same allele is on other chromosome
            }
            else
                cols = td + "</td>" + td + "</td>";

            return cols
        } // callsToCols()

    } // bldResultTbl()

    function addPopNameTooltips() { // also adds click handler for Sample name cell
        $(".report_sample_col").each(function () {
            var oSamp = sampleObj($(this).text());
            if (oSamp) {
                var id = $(this).attr('id');
                if (id !== "") {
                    mutooltip.add('#' + id, "Population " + oSamp.population);
                    var $id = $('#' + id);
                    $id.click(function () {
                        $id.siblings("td").andSelf().toggleClass("results_sample_exclude");
                        $id.parent().toggleClass("collapse_row");
                        manageExcludeArray(mu.resultsInfo.aExcludedSamples,
                            oSamp.name, $id.hasClass("results_sample_exclude"));
                    });
                }
            }
        });
    }

    function setExcludedSamplesAndLoci() {
        for (var ix = 0; ix < mu.resultsInfo.aExcludedLoci.length; ix++) {
            setLocusExclusionByName(mu.resultsInfo.aExcludedLoci[ix], true);
        }
        for (ix = 0; ix < mu.resultsInfo.aExcludedSamples.length; ix++) {
            setSampleExclusionByName(mu.resultsInfo.aExcludedSamples[ix], true);
        }
    }

    function setSampleExclusionByName(sample_nm) {
        $("#report_sample_name_" + sample_nm).siblings("td").andSelf().addClass("results_sample_exclude");
        manageExcludeArray(mu.resultsInfo.aExcludedSamples, sample_nm, true);
    }

    function setLocusExclusion($ele, locus_nm, to_exclude) {
        var nxt = padSpanTxt((to_exclude) ? "&#x2612;" : "&#x2610;");
        $ele.html(nxt); // this does check box toggle
        (to_exclude) ? $ele.addClass("exclude_locus") : $ele.removeClass("exclude_locus");

        // following should appropriately mark columns associate with locus_nm
        var $tds = $('td.rpt_locus_' + locus_nm);
        (to_exclude) ? $tds.addClass("results_locus_exclude") : $tds.removeClass("results_locus_exclude");

        manageExcludeArray(mu.resultsInfo.aExcludedLoci, locus_nm, to_exclude);
    }

    function setLocusExclusionByName(locus_nm, to_exclude) {
        var $ele = $("th#report_locus_name_" + locus_nm + " span.report_exclude_locus_span");
        setLocusExclusion($ele, locus_nm, to_exclude);
    }

    function initResultsInfo() {
        if (!mu.resultsInfo) mu.resultsInfo = {};
        if (!mu.resultsInfo.aExcludedLoci) mu.resultsInfo.aExcludedLoci = [];
        if (!mu.resultsInfo.aExcludedSamples) mu.resultsInfo.aExcludedSamples = [];
        if (!mu.resultsInfo.overriddenLens) mu.resultsInfo.overriddenLens = {};
    }

    function manageExcludeArray(array, name, to_exclude) {
        var ix = array.indexOf(name);
        if (ix > -1 && !to_exclude) array.splice(ix, 1);
        else if (ix === -1 && to_exclude) array.push(name);
    }

    function padSpanTxt(chr) {
        var padsize = 5;
        var padding = repeat("&nbsp;", padsize); // Array(padsize + 1).join("&nbsp;");
        return padding + chr + padding;
    }

    function repeat(str, num) {
        if (num < 1) return "";
        return Array(num + 1).join(str);
    }

    function locusValid(locusNm) {
        return mu.oLocusCalls[locusNm] && ! isLocusExcluded(locusNm);
    }

    function isSampleExcluded(sample_nm) {
        return mu.resultsInfo.aExcludedSamples.indexOf(sample_nm) > -1;
        // return $("#report_sample_name_"+sample_nm).hasClass("results_sample_exclude");
    }
    this.isSampleExcluded = isSampleExcluded;

    function isLocusExcluded(locus_nm) {
        return mu.resultsInfo.aExcludedLoci.indexOf(locus_nm) > -1;
        // return $("th#report_locus_name_"+locus_nm + " span.report_exclude_locus_span").hasClass("exclude_locus");
    }
    this.isLocusExcluded = isLocusExcluded;

    this.copyTableAsMSA = function (event) {
        if (exportFormatter("MSA"))
            copiedMsg("#rs_copymsg");
    };
    this.copyTableAsStructure = function (event) {
        if (exportFormatter("Structure"))
            copiedMsg("#rs_copymsg");
    };
    function copiedMsg(id) {
        $(id).hide().html("copied to clipboard").fadeIn(300).delay(1500).fadeOut(700)
    }

    this.showLocusNameStats = function (locus_nm) {

        var msg   = mu.oStats.getLocusTextBlock(locus_nm, false);
        var btn   = "<button onclick='mu.oResults.copyStats(\"" + locus_nm + "\")'>" + locus_nm + "</button>";
        var close = "<span class='close' onclick='mu.oResults.closeStats()'>x</span>";
        var cpymsg= "&nbsp;<i><span id='stat_copymsg'>&nbsp;</span></i>";

        var html = "<div id='stat_rpt'><pre>" + close + btn + cpymsg + msg + "</pre></div>";

        $("#rs_stat_pane").html( html );
    };
    this.closeStats = function() {
        $("#rs_stat_pane").empty();
    };
    this.copyStats = function (locus_nm) {
        var msg = locus_nm + "" + mu.oStats.getLocusTextBlock(locus_nm, false);
        var $wrksht = $("#export_worksheet");
        $wrksht.html("<pre>" + msg + "</pre>");
        $wrksht.removeClass("hidden");
        var success = copyTextToClipboard($wrksht.get(0));
        $wrksht.addClass("hidden");

        if (success)
            copiedMsg("#stat_copymsg");
    };

    this.toggleLocusExclusion = function (event, locus_nm) {
        var $ele = $(event.currentTarget);
        var cval = $ele.text().trim().charCodeAt(0);
        var to_exclude = (cval === 9744); // we are toggling to exclude the locus if true, including it otherwise

        setLocusExclusion($ele, locus_nm, to_exclude);
    };

    function exportFormatter(type) {
        // format used in the Microsatellite Analyzer package
        // fill export_worksheet and then copy it to clipboard
        var $wrksht = $("#export_worksheet");
        var lf, nm, pts, numLoci = numLocusNames(), numSamples = mu.aSampleName.length;
        var curPopName = "", curPopNum = 0;
        var str = "";
        msa_type = "d";
        var blank_placeholder = getBlankPlaceholder();

        if (type==="MSA") { // MSA has 2 lines at top that Structure format does not
            str = "2\t\t"; //+ repeat("\t2", numCalledValidLoci() * 2)
            for (lf = 0; lf < numLoci; lf++) {
                nm = getLocusName(lf);
                if (locusValid(nm)) {
                    var motif_len = getMotifLen(nm);
                    str += "\t" + motif_len + "\t" + motif_len;
                }
            }
            str += "\n";
            str += repeat("\t", numLoci * 2) + "\n";
        }

        str += (type==="MSA") ? "\t\t" : "\t";
        for (lf = 0; lf < numLoci; lf++) {
            nm = getLocusName(lf);
            if (locusValid(nm)) {  // MSA repeats the locus name, Structure leaves 2nd one blank
                str += (type==="MSA") ? " \t " + nm + " \t " + nm : "\t"+nm+"\t";
            }
        }
        str += "\n"; // locus name line completed

        for (var s = 0; s < numSamples; s++) { // for each sample
            var samp = mu.aSampleName[s];
            if (isSampleExcluded(samp))
                continue;

            chkPopName(samp);
            if (type==="MSA") // MSA has pop number a 'd' and sample name
                str += curPopNum + "\t"+ msa_type +"\t" + samp;
            else // structure has sample name then pop number
                str += samp + "\t" + curPopNum;

            for (lf = 0; lf < numLoci; lf++) {
                nm = getLocusName(lf);
                if (locusValid(nm)) {
                    pts = mu.oLocusCalls[nm][samp];
                    if (pts && pts.length > 0) {
                        str += "\t" +  pts[0][0] + "\t";
                        str += (pts.length === 1) ? pts[0][0] : pts[1][0];
                    }
                    else
                        str += "\t" + blank_placeholder + "\t" + blank_placeholder;
                }
            }
            str += "\n";
        }

        $wrksht.html("<pre>" + str + "</pre>");
        $wrksht.removeClass("hidden");
        var success = copyTextToClipboard($wrksht.get(0));
        $wrksht.addClass("hidden");

        return success;

        function chkPopName(sample) { // alters curPopName, curPopNum
            var pop = popName(sample);
            if (pop !== curPopName) {
                curPopName = pop;
                curPopNum++
            }
        }

        function numCalledValidLoci() { // we've called alleles for this locus and we aren't specifically excluding it
            var lf_ix, numCalled = 0;
            for (lf_ix = 0; lf_ix < numLocusNames(); lf_ix++) {
                var nm = getLocusName(lf_ix);
                if (locusValid(nm)) numCalled++;
            }
            return numCalled;
        }
        function getMotifLen(locusNm) {
            var len = 2, locusObj = getLocusObj(locusNm);
            if (locusObj && locusObj.Motif) len = locusObj.Motif.length;
            if (len < 2) len = 2;
            return len;
        }
        function getBlankPlaceholder() {
            var blank_placeholder = options.getOption("export", "blank_cell_placeholder");
            if (blank_placeholder)
                return blank_placeholder;
            return "-9";
        }
    }
}