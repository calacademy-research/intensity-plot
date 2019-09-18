function updateAlleleCountsDisplay(parent, curPrimerName, updateIfZero) {

    var sampleCount = 0;
    var globalPrimersSample = mu.oLocusCalls[curPrimerName];
    var hasBeenCalled=false;
    for (var curSample in globalPrimersSample) {
        var peakArray = globalPrimersSample[curSample];
        if (peakArray != null) {
            hasBeenCalled=true;
            if (peakArray.length > 0) {
                sampleCount = sampleCount + 1; //peakArray.length;
            }
        }
    }
    if (!hasBeenCalled)  {
        clearCalledIndicator(parent,curPrimerName);
        return;
    }

    if (!updateIfZero && sampleCount === 0) {
        return;
    }
    setCalledIndicators(parent, sampleCount, curPrimerName);
};

function GridLocus(primerName, sampleDataArray, minColumn, maxColumn, sampleNameArray) {
    var MAX_GROUPS = 50;
    var gridGraphCount = 0;
    var gridGraphNextVal = 0;
    var gridObjects = [];
    var currentlySelectedGroup = 0;

    var that = this;


    that.addGridGraph = function (overrideDataSet, overrideSampleNames) {

        currentlySelectedGroup = gridGraphNextVal;
        if (gridGraphNextVal > 0) {
            addGroupSelectorRadio(gridGraphNextVal);
        }
        gridObjects[gridGraphNextVal] = new GridGraph(gridGraphNextVal,
            (overrideDataSet === undefined) ? {} : overrideDataSet,
            minColumn,
            maxColumn,
            (overrideSampleNames === undefined) ? [] : overrideSampleNames,
            primerName);
        enableHandlers(gridGraphNextVal);
        gridGraphCount++;
        gridGraphNextVal++;
    };

    that.disableLocus = function () {
        currentlySelectedGroup = parseInt($('input[name=selectGroup]:checked', '#gridGraphSelector').val());

        for (var curGridGraph = 0; curGridGraph < gridGraphNextVal; curGridGraph++) {
            if (gridObjects[curGridGraph] !== undefined) {
                disableHandlers(curGridGraph);
                clearCanvases(curGridGraph);
                removeGroupSelectorRadio(curGridGraph);
            }
        }
    };

    that.enableLocus = function () {
        $('#addGroup').prop("disabled", false);
        $('#removeGroup').prop("disabled", true);
        selectCorrectRadioButton();
        for (var curGridGraph = 0; curGridGraph < gridGraphNextVal; curGridGraph++) {
            if (gridObjects[curGridGraph] !== undefined) {
                if (curGridGraph > 0) {
                    addGroupSelectorRadio(curGridGraph);
                }
                enableHandlers(curGridGraph);
                gridObjects[curGridGraph].setup();
            }
        }

    };

    function enableHandlers(groupId) {
        document.getElementById("sample_names" + groupId).addEventListener("click", function (e) {
            handleSampleClick(e, groupId);
        });
        document.getElementById("mainCanvasBackground" + groupId).addEventListener("click", function (e) {
            handleCanvasClick(e, groupId);
        });
    }

    function disableHandlers(groupId) {
        $('#mainCanvasBackground' + groupId).unbind();
        $('#sample_names' + groupId).unbind();

        var el = document.getElementById('mainCanvasBackground' + groupId);
        var elClone = el.cloneNode(true);
        el.parentNode.replaceChild(elClone, el);

        var sampleNames = document.getElementById('sample_names' + groupId);
        var sampleNamesClone = sampleNames.cloneNode(true);
        sampleNames.parentNode.replaceChild(sampleNamesClone, sampleNames);
    }

    function removeGridGraphGroup(doomedGroup) {

        clearCanvases(doomedGroup);
        gridGraphCount--;
        removeGroupSelectorRadio(doomedGroup);
        // redundant if we're sending original a click, but we might change the behaviour
        // to be the next valid object down or up.

        gridObjects[0].cleanupHighlights(gridObjects[doomedGroup].getSampleNameArray());
        gridObjects[doomedGroup] = undefined;
        // Select the next checkbox down if any. If not, move up.
        selectCorrectRadioButton();
    }

    function selectCorrectRadioButton() {
        if ($('#radioCheckBox' + currentlySelectedGroup).length) {
            $('#radioCheckBox' + currentlySelectedGroup).click();
            return;
        }

        var movedSelector = false;
        for (var i = currentlySelectedGroup - 1; i >= 1; i--) {
            if (gridObjects[i] !== undefined) {
                $('#radioCheckBox' + i).click();
                movedSelector = true;
                break;
            }
        }
        if (!movedSelector) {
            for (i = currentlySelectedGroup; i <= gridGraphNextVal; i++) {
                if (gridObjects[i] !== undefined) {
                    $('#radioCheckBox' + i).click();
                    break;
                }
            }
        }
        if (gridGraphCount === 1)
            $('#removeGroup').prop("disabled", true);
    }

    function addGroupSelectorRadio(groupId) {
        $('#gridGraphSelector').append("<div id='radioGridSelector" +
            groupId + "'>" +
            "<input  id='radioCheckBox" +
            groupId +
            "' type='radio' name='selectGroup' value= " +
            groupId +
            " > g" +
            groupId +
            "</input></div>");

        $('#radioCheckBox' + groupId).click(function () {
            $('#removeGroup').prop("disabled", false);
        });
        $('#radioCheckBox' + groupId).click();
    }

    function removeGroupSelectorRadio(groupId) {
        $('#radioGridSelector' + groupId).remove();

    }

    that.removeGridGraph = function () {
        currentlySelectedGroup = parseInt($('input[name=selectGroup]:checked', '#gridGraphSelector').val());
        removeGridGraphGroup(currentlySelectedGroup);
    };

    function handleSampleClick(e, groupId) {
        var rect = document.getElementById("sample_names" + groupId).getBoundingClientRect();
        var y = parseInt(e.clientY);

        var curRow = gridObjects[groupId].getRowFromCoords(rect, y);


        // curRow is set to samplename.

        currentlySelectedGroup = parseInt($('input[name=selectGroup]:checked', '#gridGraphSelector').val());
        toggleGroup(groupId, curRow);
    }

    function handleCanvasClick(e, groupId) {
        var rect = document.getElementById("mainCanvas" + groupId).getBoundingClientRect();
        currentlySelectedGroup = parseInt($('input[name=selectGroup]:checked', '#gridGraphSelector').val());

        var x = parseInt(e.clientX);
        var y = parseInt(e.clientY);

        var sampleLength = gridObjects[groupId].getColFromCoords(rect, x);
        var sampleName = gridObjects[groupId].getRowFromCoords(rect, y);
        // check to see if the current item is a called allele. If so, remove it
        // from the allele list and unlight it  ralph

        // var hexColor;
        if (isPoint(sampleName, sampleLength)) {
            if (isPeak(primerName, sampleName, sampleLength)) {
                unPeak(sampleName, sampleLength)
            } else {
                enPeak(sampleName, sampleLength);
            }
        } else {
            // if we don't hit on anything, pass it to the sample click handler
            handleSampleClick(e, groupId);
        }
    }


    that.redraw = function () {
        for (var i = 0; i < MAX_GROUPS; i++) {
            clearCanvases(i);
        }


    };

    function toggleGroup(clickedInGroupId, sampleName) {
        if (gridGraphCount === 1) {
            subsetArray = {};
            subsetArray[sampleName] = sampleDataArray[sampleName];
            currentlySelectedGroup = gridGraphNextVal;
            addGridGraph(subsetArray, [sampleName]);
            gridObjects[0].highlightSample(sampleName, currentlySelectedGroup, true);

            return;
        }
        var masterDataArray = gridObjects[0].getSampleDataArray();

        // Take a look at the data set for the target group.
        // If it's not in the target group, add it. If it IS in the
        // target group, remove it.

        // Wrong. Look at all target groups. If it's in ANY  group, remove it.
        // if it's not in any  groups, add it to target group.
        var dataArraySubset;
        var sampleNameArraySubset;
        var foundGroup = -1;
        for (var i = 1; i < gridGraphNextVal; i++) {
            if (gridObjects[i] !== undefined && gridObjects[i] !== null) {
                dataArraySubset = gridObjects[i].getSampleDataArray();
                if (dataArraySubset[sampleName] !== undefined) {
                    // Add it to currentlySelectedGroup
                    foundGroup = i;

                }
            }
        }


        if (foundGroup < 1) {
            if (currentlySelectedGroup < 1) {
                // For some reason, user has chosen to add to g0. This makes no sense.
                return;
            }
            // Add it to currentlySelectedGroup
            dataArraySubset = gridObjects[currentlySelectedGroup].getSampleDataArray();
            sampleNameArraySubset = gridObjects[currentlySelectedGroup].getSampleNameArray();
            dataArraySubset[sampleName] = masterDataArray[sampleName];
            sampleNameArraySubset.push(sampleName);
            gridObjects[0].highlightSample(sampleName, currentlySelectedGroup, true);
            gridObjects[currentlySelectedGroup] = new GridGraph(currentlySelectedGroup,
                dataArraySubset,
                minColumn,
                maxColumn,
                sampleNameArraySubset,
                primerName);


        } else {
            dataArraySubset = gridObjects[foundGroup].getSampleDataArray();
            sampleNameArraySubset = gridObjects[foundGroup].getSampleNameArray();

            // Remove it from currentlySelectedGroup
            delete dataArraySubset[sampleName];
            for (var i = 0; i < sampleNameArraySubset.length; i++) {
                if (sampleNameArraySubset[i] === sampleName) {
                    sampleNameArraySubset.splice(i, 1);

                }
            }
            //  mu.oLocusCalls[primerName][sampleName].splice(i, 1);

            // gridObjects[removeGroup].setup();
            gridObjects[foundGroup] = new GridGraph(foundGroup,
                dataArraySubset,
                minColumn,
                maxColumn,
                sampleNameArraySubset,
                primerName);
            gridObjects[0].highlightSample(sampleName, foundGroup, false);

        }

    }
    ;

    function clearCanvases(id) {
        $('#mainCanvas' + (id)).replaceWith("<canvas id='mainCanvas" + (id) + "' class='canvas" + (id) + "' style='position:relative; '></canvas>");
        $('#mainCanvasBackground' + (id)).replaceWith("<canvas id='mainCanvasBackground" + (id) + "' style = 'position:relative;'></canvas>");
        $('#sample_names' + (id)).replaceWith("<canvas id='sample_names" + (id) + "' class='canvas" + (id) + "'  style='position:relative;'></canvas>");
        $('#length_labels' + (id)).replaceWith("<canvas id='length_labels" + (id) + "' class='canvas" + (id) + "' ></canvas>");
        $('#hit_bars' + (id)).replaceWith("<canvas id='hit_bars" + (id) + "' class='canvas" + (id) + "'></canvas>");
        $('#mainCanvas' + (id)).width(0);
        $('#mainCanvasBackground' + (id)).width(0);
        $('#sample_names' + (id)).width(0);
        $('#length_labels' + (id)).width(0);
        $('#hit_bars' + (id)).width(0);
        $('#graph_container' + (id)).width(0);
        $('#graph_and_labels' + (id)).width(0);


    }


    function enPeak(sampleName, alleleLength) {
        var curSamplePeaks = mu.oLocusCalls[primerName];
        if (!curSamplePeaks) {
            mu.oLocusCalls[primerName] = {};
            curSamplePeaks = mu.oLocusCalls[primerName];
        }

        if (!curSamplePeaks[sampleName]) {
            mu.oLocusCalls[primerName][sampleName] = [];
        }
        var numCalled = mu.oLocusCalls[primerName][sampleName].length;
        if (numCalled >= 2) {
            return false;
        }

        for (var i = 0; i < numCalled; i++) {
            var curLength = mu.oLocusCalls[primerName][sampleName][0];

            if (curLength === alleleLength)
                return true;
        }

        // Get the number of reads on this sample
        var reads = getReadCount(primerName, sampleName, alleleLength);


        mu.oLocusCalls[primerName][sampleName].push([alleleLength, reads]);
        // update on all valid grid graphs.
        for (curGridGraph in gridObjects) {
            gridObjects[curGridGraph].updatePoint(true, sampleName, alleleLength);
        }

        updateAlleleCountsDisplay('#explore_scatter', primerName, true);


    }

    function unPeak(sampleName, alleleLength) {
        var curSamplePeaks = mu.oLocusCalls[primerName];
        if (!curSamplePeaks)
            return false;
        curSamplePeaks = mu.oLocusCalls[primerName][sampleName];
        for (var i = 0; i < curSamplePeaks.length; i++) {
            if (curSamplePeaks[i][0] === alleleLength) {
                mu.oLocusCalls[primerName][sampleName].splice(i, 1);
                break;
            }
        }
        // update on all valid grid graphs.
        for (curGridGraph in gridObjects) {
            gridObjects[curGridGraph].updatePoint(false, sampleName, alleleLength);
        }

        updateAlleleCountsDisplay('#explore_scatter', primerName, true);
    }

    function isPoint(sampleName, alleleLength) {
        for (var index in sampleDataArray[sampleName]) {
            var curLength = sampleDataArray[sampleName][index][0];
            if (curLength === alleleLength)
                return true;
        }
        return false;
    }

    that.setup = function () {
        $('#addGroup').prop("disabled", false);
        $('#removeGroup').prop("disabled", true);
        that.addGridGraph(sampleDataArray, sampleNameArray);
    };


    that.setup();

}