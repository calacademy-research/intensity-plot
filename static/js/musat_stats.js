// stats show for each locus by population (later to add each population by all loci)
// currently called from button in Results tab

function Stats_obj() { // newed object created by musat_flow.js setup()
    var ixLastStatsRetrieved = -1; // index of last Stat Block retrieved

    // main methods
    this.rewind = function () {
        ixLastStatsRetrieved = -1
    };
    this.getNextLocusTextBlock = function () {
        setNextLocusIndex();
        return this.getLocusTextBlock(curLocusName())
    };
    this.getLocusTextBlock = function (locusName) {
        return st_locusStatTextBlock(locusName)
    };

    // auxiliary but might be useful
    this.nextLocusName = function (from_ix) {
        return getLocusName(nextLocusIndex(from_ix))
    };

    curLocusName = function () {
        return getLocusName(ixLastStatsRetrieved)
    };
    setNextLocusIndex = function () {
        ixLastStatsRetrieved = nextLocusIndex();
        return ixLastStatsRetrieved
    };
    nextLocusIndex = function (from_ix) { // if from_ix not defined ixLastStatsRetrieved is used
        from_ix = (from_ix) ? from_ix : ixLastStatsRetrieved;
        var len = numLocusNames();
        for (var l_ix = ++from_ix; l_ix < len; l_ix++) {
            var locusCalls = mu.oLocusCalls[getLocusName(l_ix)];
            if (locusCalls)
                return l_ix;
        }
        return len
    };

    function st_popNameArray() {
        var pna = [];
        $.each(mu.aSampleName, function (ix, sample) {
            var name = popName(sample);
            if (name !== "" && $.inArray(name, pna) === -1) {
                pna.push(name);
            }
        });
        return pna;
    }

    function st_locusStatTextBlock(locusNm, includeHeader) {
        var popAllelesByLocus = st_getLocusAllelesByPop(0); // popAllelesByLocus[locusNm][popNm] has array of allele lens in pop popNm
        var compactPopAllelesByLocus = st_getLocusAllelesByPop(1);
        var pops = st_popNameArray();
        if (pops.length < 1)
            return "";

        var expHet, hws, hetstr = "<i>H</i><sub>E</sub> ";
        var As, as, AA, aa, Aa, sng_A, sngl_a;
        var msg = (includeHeader) ? "<b>"+ locusNm +"</b>" : "";
        $.each(pops, function (ix, popNm) {
            var lens = st_alleleArrayToLens(compactPopAllelesByLocus[locusNm][popNm]);
            var aAlleleRanges = st_lensToAlleleRanges(lens);
            var popAlleleSet = popAllelesByLocus[locusNm][popNm];
            var numAlleles = aAlleleRanges.length;
            As = 0;
            as = 0;
            AA = 0;
            aa = 0;
            Aa = 0;
            if (numAlleles <= 2) {
                $.each(popAlleleSet, function (ix, alleles) {
                    typ = st_twoAlleleType(alleles, aAlleleRanges);
                    if (typ === 11) {
                        AA++;
                        As += 2
                    }
                    if (typ === 22) {
                        aa++;
                        as += 2
                    }
                    if (typ === 12 || typ === 21) {
                        Aa++;
                        As++;
                        as++
                    }
                });
                msg += "\n" + popNm;
                expHet = calcExpHet([As, as]);
                hws = HWstrs(AA, aa, Aa);
                sng_A = (aAlleleRanges[0]) ? aAlleleRanges[0] : 0;
                sng_a = (aAlleleRanges[1]) ? aAlleleRanges[1] : 0;
                if (numAlleles === 1) {
                    msg += "    \t" + hetstr + st_fixNum(expHet) + "  " + hws + "  \tA's: " + As + "\t\t\tAA " + AA.toString() + "  \t\t\t(A: " + aAlleleRanges + ")"
                } else {
                    msg += "   \t" + hetstr + st_fixNum(expHet) + "  " + hws + "  \tA's: " + As + " a's: " + as.toString() + "     \tAa " + Aa.toString() + ". AA " + AA.toString() + ". aa " + aa.toString() + ". " +
                        "\t(A: " + sng_A + ".  a: " + sng_a + ")"
                }
            }
            else {
                msg += "\n" + popNm + "  \tmore than 2 alleles found: " + aAlleleRanges
            }
        });

        return msg
    }

    function calcExpHet(aAlleleCounts) { // arg array has 2 elements, number of allele type 1 and number of allele type 2
        var tot = 0;
        $.each(aAlleleCounts, function (ix, count) {
            tot += count
        });
        var sumFreqSqrd = 0;
        $.each(aAlleleCounts, function (ix, count) {
            sumFreqSqrd += Math.pow((count / tot), 2)
        });
        var val = 1 - sumFreqSqrd; // return 100% minus the freq squared summation of each allele type
        return (isNaN(val) ? 0 : val)
    }

    function calcHWandFst(AA_num, aa_num, Aa_num) {
        var AA_pct=0, aa_pct=0, Aa_pct=0, A_pct=0, a_pct=0, twoAa=0, Fst=0, tot;

        tot = AA_num + aa_num + Aa_num;
        if (tot > 0) {
            AA_pct = AA_num / tot;
            aa_pct = aa_num / tot;
            Aa_pct = Aa_num / tot;
        }
        A_pct = AA_pct + 0.5 * Aa_pct;
        a_pct = aa_pct + 0.5 * Aa_pct;
        twoAa = 2 * A_pct * a_pct;
        Fst = (twoAa - Aa_pct) / twoAa; if (isNaN(Fst)) Fst = 0;
        return [A_pct * A_pct, a_pct * a_pct, twoAa, Fst] // AA + aa + 2Aa for HWs and Fst in 4th pos
    }

    function st_fixNum(num) {
        if (num === 1) {
            return "1.00"
        }
        var t = num.toFixed(3);
        if (t.startsWith("0.")) {
            t = t.slice(1) // remove the prefix 0
        } else if (t.startsWith("-0.")) {
            t = "-" + t.slice(2)
        }
        return t
    }

    function HWstrs(AA_num, aa_num, Aa_num) {
        var HWAA = "HW<sub>AA</sub> ", HWaa = "HW<sub>aa</sub> ", HWAa = "HW<sub>Aa</sub> ", Fst = "F<sub>st</sub>";
        var hws = calcHWandFst(AA_num, aa_num, Aa_num);
        return HWAA + st_fixNum(hws[0]) + "  " + HWaa + st_fixNum(hws[1]) + "  " + HWAa + st_fixNum(hws[2]) + "  " + Fst + " " + st_fixNum(hws[3])
    }

    // return object whose whose members are named by locus.
    // each locus member is an object whose members are named by population group (derived from popname function).
    // each population group member is an array containing allele size/counts for all samples in a population.
    function st_getLocusAllelesByPop(compact) {
        compact = compact || 0;
        var lociAlleles = {}; // each top-level member is an object named by locus

        var num_loci = numLocusNames(); // new way to iterate through loci names 23Jun2017 JBH

        for (var locusFilenameIndex = 0; locusFilenameIndex < num_loci; locusFilenameIndex++) {
            var curLocus = getLocusName(locusFilenameIndex);
            var locusCalls = mu.oLocusCalls[curLocus];
            if (locusCalls) {
                lociAlleles[curLocus] = {};
                $.each(locusCalls, function (sample, alleles) {
                    if (mu.oResults.isSampleExcluded(sample))
                        return; // don't include this sample's alleles
                    var pop = popName(sample);
                    if (!(pop in lociAlleles[curLocus]))
                        lociAlleles[curLocus][pop] = []; // population group will have an array of alleles from all its samples
                    lociAlleles[curLocus][pop].push(alleles)
                })
            }
        }

        if (compact <= 0) {
            return lociAlleles
        }

        // compact each population's individual list of alleles into one where each allele length
        // is listed only once with all counts totaled. Eg, allele [145, 1023] in samp1 and [145, 250] samp2
        // becomes [145, 1273]
        var lociCompactedAlleles = {};
        var compactedAlleles, len, count, ix;
        $.each(lociAlleles, function (locus, popAlleles) {
            locusName = locus;
            lociCompactedAlleles[locus] = {};
            $.each(popAlleles, function (population, aSampleAlleles) {
                lociCompactedAlleles[locus][population] = [];
                compactedAlleles = lociCompactedAlleles[locus][population];
                $.each(aSampleAlleles, function (ix, alleles) {
                    if (alleles.length > 0) { // an individual sample's alleles, 0, 1, or 2
                        $.each(alleles, function (ax, allele) {
                            len = allele[0];
                            count = allele[1];
                            ix = ixOfAllele(compactedAlleles, len);
                            if (ix < 0) { // first time we've seen this len for this pop in this locus, add it
                                compactedAlleles.push([len, count])
                            } else { // alreay in there just add the count from this sample
                                compactedAlleles[ix][1] += count
                            }
                        })
                    }
                });
                compactedAlleles.sort(function (a, b) {
                    return a[0] - b[0];
                })
            })
        });

        return lociCompactedAlleles;

        function ixOfAllele(alleleArray, alleleLen) {
            for (var ix = 0; ix < alleleArray.length; ix++) {
                if (alleleArray[ix][0] === alleleLen) {
                    return ix
                }
            }
            return -1
        }
    }

    // passed in array contains elements that are 2 value arrays soted by first value. first val of each such element is allele len
    // this returns an array of just the lens as elements
    function st_alleleArrayToLens(alleleArray) {
        var alleleLens = [];
        var alen, last = 0;
        $.each(alleleArray, function (ix, alleleEle) {
            if (alleleEle.length === 2) {
                alen = alleleEle[0];
                if (alen !== last)
                    alleleLens.push(alen);
                last = alen
            }
        });
        return alleleLens
    }

    // take sorted array of lens representing alleles and organize into an array containing
    // ranges eg [144,145,146,158,159] becomes [ [144,145,146], [158,159] ]
    function st_lensToAlleleRanges(aLens) {
        var ranges = [], curRange = [];
        var last = aLens[0];
        $.each(aLens, function (ix, len) {
            if (Math.abs(len - last) <= 1) { // append to curRange if same value or within 1
                curRange.push(len)
            } else {
                ranges.push(curRange);
                curRange = [len]
            }
            last = len
        });
        if (curRange.length > 0) {
            ranges.push(curRange)
        }
        return ranges
    }

    function st_twoAlleleType(aAlleles, alleleRanges) {
        if (aAlleles.length === 0)
            return 0;

        var alleleRange = inRanges(aAlleles[0][0], alleleRanges);
        if (aAlleles.length === 1) {
            if (alleleRange === 1) {
                return 11
            } else if (alleleRange === 2) {
                return 22
            }
        } else if (aAlleles.length === 2) {
            var alleleRange2 = inRanges(aAlleles[1][0], alleleRanges);
            return alleleRange * 10 + alleleRange2
        }
        return 0 // unknown
    }

    function inRanges(alleleLen, alleleRanges) {
        var rangeFound = 0;
        $.each(alleleRanges, function (ix, aRange) {
            if ($.inArray(alleleLen, aRange) !== -1) {
                rangeFound = ix + 1;
                return false
            }
        });
        return rangeFound
    }
}
