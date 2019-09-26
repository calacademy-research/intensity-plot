import $ from "jquery"
import Rainbow from "rainbowvis.js"
import {mu } from "./musat_global"
import {isPeak} from "./musat_utils"

//ES6 module for the grid graph display and logic 

// sampleDataArray[sample_name]=[[musat length, number of reads]]
// inputs are slightly redundant with hitArray and sampleNameArray.
// SampleName array gives the sample ordering.
function GridGraph(canvasId, // Integer denoting the 'group' on the page
                   sampleDataArray,
                   minColumn,
                   maxColumn,
                   sampleNameArray,
                   primerName) {    

    sampleNameArray = sampleNameArray || [];                  
    var displayRow = {};
    // tracks vertical spacing, indexed by sample name. If we color code sample groups, this is where
    // it will be tracked
    // The "y" value is in the middle of the row.
    var xSize = 0;
    var ySize = 0;
    var ySpacingPx = 12;
    var xSpacingPx = 12;
    var sumBarHeight = 40;
    var doDrawColumnArray = []; // index 0 = minColumn. Is this column drawn or crunched into a skipColumn?
    var colPositions = [];  // index 0 = minColumn. x co-ord of rhs of column
    var drawColumnCount = 0;  // total number of regular drawn vertical columns
    var skipColumnCount = 0;  // total number of half-width "skip" columns.

    var peakBuckets = {}; // indexed by sample length, contains total sample count.
    var bucketMapping = {}; // maps each populated bucket to a monitonically increasing index


    var canvasName = 'mainCanvas' + canvasId;
    var mainCanvas;
    var canvasRainbow;
    var bucketRainbow;
    var intensityArray;
    var that = this;
    var highlights = {};


    that.setup = function () {
        // try {
         //   sampleNameArray.sort(sortByPopThenSample); // sampleNameArray.sort(naturalSort);

            intensityArray = calculateIntensityArray();
            var verticalSums = sumVerticals(intensityArray, sampleNameArray);
            calculateSkipColumns(verticalSums);

            setGraphSizes();
           setupCanvas();       //
            setupVerticalSpacing();
            drawSampleNames();    //
            drawLengthLabels();    //
            drawHorizontalGrid();   //
            drawVerticalGrid();
            computePeakBuckets();    //
            drawPoints(intensityArray); //
            drawSumBars(verticalSums);   //
        // } catch (err) {
        //     alert("Setup error: " + err);
        //     return;
        // }
        // works of the background because it's the second html element,
        // which - when respositioned over the first - grabs the mouse action.
        // re-arrange here or in html/css; this is easier.

        var background = $('#' + 'mainCanvasBackground' + canvasId);


        background.mousemove(function (e) {
            handleMouseMove(e);
        });
        background.mouseleave(function (e) {
            handleMouseLeave(e);
        });
        // document.getElementById("sample_names" + canvasId).addEventListener("click", function (e) {
        //     handleSampleClick(e);
        // });
        // document.getElementById("mainCanvasBackground" + canvasId).addEventListener("click", function (e) {
        //     handleCanvasClick(e);
        // });

        canvasRainbow = new Rainbow();
        canvasRainbow.setSpectrum('red', 'yellow', 'green', 'blue', 'black');
        canvasRainbow.setNumberRange(1, 7);
        restoreHighlights();
    };
    that.setup();

    that.getRowFromCoords = function (rect, absY) {
        var relY = absY - rect.top;

        for (var curRow in displayRow) {
            if (relY > displayRow[curRow].y && (relY <= displayRow[curRow].y + ySpacingPx)) {
                break;
            }
        }
        return curRow;
    };

    that.getColFromCoords = function (rect, absX) {
        var relX = absX - rect.left;


        // var length = Math.floor(relX / xSpacingPx) + minColumn;
        var col = 0;
        while (relX >= colPositions[col]) {
            col++;
        }
        while (doDrawColumnArray[col] === false)
            col--;
        return minColumn + col;
    };


    function handleMouseLeave(e) {
        var tipCanvas = document.getElementById("tip");

        tipCanvas.style.left = (-20000) + "px";
        tipCanvas.style.top = (0) + "px";
    }

    that.removeSampleHighlight = function (sampleName) {
        that.highlightSample(sampleName, 0, false);
    };

// can only highlight samples in screen 0
    that.highlightSample = function (sampleName, currentlySelectedGroup, doHighlight) {
        var c = document.getElementById("mainCanvasBackground0");
        var context = c.getContext("2d");
        var ulY = displayRow[sampleName].y;
        var hexColor;
        if (doHighlight) {
            hexColor = '#' + canvasRainbow.colourAt(currentlySelectedGroup);

        } else {
            hexColor = 'white';

        }
        context.beginPath();
        context.rect(0, ulY + 1, xSize, ySpacingPx);
        context.strokeStyle = hexColor;
        context.fillStyle = hexColor;
        context.lineWidth = 1;
        context.fill();
        if (doHighlight) {
            highlights[sampleName] = currentlySelectedGroup;
        } else {
            delete highlights[sampleName];
        }
    }

    function restoreHighlights() {

        for (var sampleName in highlights) {
            that.highlightSample(sampleName, highlights[sampleName], true);
        }
    }


    function handleMouseMove(e) {
        if (sampleDataArray === null)
            return;
        var rect = mainCanvas.getBoundingClientRect();
        var length = -1;
        var sampleName = -1;
        var x = parseInt(e.clientX);
        var y = parseInt(e.clientY);

        var tipCanvas = document.getElementById("tip");
        var tipCtx = tipCanvas.getContext("2d");
        var relX = x - rect.left;
        var relY = y - rect.top;


        if (relX >= 0 && relX <= rect.width && relY > 0 && relY < rect.height) {
            tipCanvas.style.left = (x + 10) + "px";
            tipCanvas.style.top = (y + 10) + "px";
            tipCtx.clearRect(0, 0, tipCanvas.width, tipCanvas.height);
            length = that.getColFromCoords(rect, x);
            sampleName = that.getRowFromCoords(rect, y);

            var sampleCount = 0;

            for (var element in sampleDataArray[sampleName]) {
                if (length === sampleDataArray[sampleName][element][0]) {
                    sampleCount = sampleDataArray[sampleName][element][1];
                }
            }

            if (isPeak(primerName, sampleName, length)) {
                var hexColor = '#e6ffe6';
                //var hexColor = '#ff0000';
                tipCtx.beginPath();
                tipCtx.rect(0, 0, tipCanvas.width, tipCanvas.height);
                tipCtx.strokeStyle = hexColor;
                tipCtx.fillStyle = hexColor;
                tipCtx.lineWidth = 1;
                tipCtx.fill();
                tipCtx.stroke();

            }
            tipCtx.fillStyle = 'black';
            if (sampleCount > 0)
                tipCtx.fillText(sampleCount, 5, 13);
            tipCtx.fillText(length, 50, 13);
            tipCtx.fillText(sampleName, 85, 13);
        }

    }

    function calculateMeanValue() {
        var totalCount = 0;
        var sum = 0;
        for (var sampleName in sampleDataArray) {
            for (var i = 0; i < sampleDataArray[sampleName].length; i++) {
                sum = sum + sampleDataArray[sampleName][i][1];
                totalCount++;

            }
        }
        return sum / totalCount;
    }

    /*
     * returns 'intensity' from 0 to 100 of each populated
     * length in a sample (each valid column in a row)
     * indexed by sample name
     */
    function calculateIntensityArray() {
        var mean = calculateMeanValue();
        var array = {};
        for (var sampleName in sampleDataArray) {
            var total = 0;

            for (var i = 0; i < sampleDataArray[sampleName].length; i++) {
                var cur = sampleDataArray[sampleName][i][1];
                total = total + cur;
            }
            array[sampleName] = {};
            for (i = 0; i < sampleDataArray[sampleName].length; i++) {
                var sampleCount = sampleDataArray[sampleName][i][1];
                var intensity = (sampleDataArray[sampleName][i][1] / total) * 100;
                if (sampleCount < mean / 50)
                    intensity = 1;

                array[sampleName][sampleDataArray[sampleName][i][0]] = intensity;
            }
        }
        return array;
    }


    function computePeakBuckets() {
        if (sampleDataArray === null ||
            sampleDataArray === undefined ||
            Object.keys(sampleDataArray).length === 0) {
            return;
        }

        var globallyCalledAlleles = mu.oLocusCalls[primerName];

        var globalHitsExist = false;
        for (var sampleName in globallyCalledAlleles) {
            if (globallyCalledAlleles && globallyCalledAlleles[sampleName]) {
                globalHitsExist = true;
                break;
            }
        }
        if (!globallyCalledAlleles) {
            mu.oLocusCalls[primerName] = {};
        }
        // peakbuckets are only called alleles (!).
        // We now do this in batch on request only - see
        // for (sampleName in sampleDataArray) {
        //     var hits;
        //     if (globalHitsExist) {
        //         hits = globallyCalledAlleles[sampleName];
        //     } else {
        //         hits = peaksFromPts(sampleDataArray[sampleName]);
        //         mu.oLocusCalls[primerName][sampleName] = hits;
        //     }
        // }
        for (var sample in sampleDataArray) {
            // [[length,hitcount],[length,hitcount]]

            for (var dataPointIndex in sampleDataArray[sample]) {
                var dataPoint=sampleDataArray[sample][dataPointIndex];
                var curColumn = dataPoint[0];
                var curValue = dataPoint[1];
                if (peakBuckets[curColumn] === undefined) {
                    peakBuckets[curColumn] = curValue;
                } else {
                    peakBuckets[curColumn] = peakBuckets[curColumn] + curValue;
                }


            }
        }


        // setting up color spectrum for our peakbuckets
        var max = 0;
        var sampleLength;
        for (sampleLength in peakBuckets) {
            if (peakBuckets[sampleLength] > max)
                max = peakBuckets[sampleLength];
        }

        var j = 0;
        for (sampleLength = minColumn; sampleLength <= maxColumn; sampleLength++) {
            if (peakBuckets[sampleLength] !== undefined) {
                bucketMapping[sampleLength] = j;
                j++;
            }
        }


        bucketRainbow = new Rainbow();
        bucketRainbow.setSpectrum("violet", "indigo", "blue", "green", "yellow", "orange", "red");

        //bucketRainbow.setSpectrum('red', 'yellow', 'green', 'blue');
        if (j != 0) {
            // Got a graph with no peaks.
            bucketRainbow.setNumberRange(0, j);
        }

    }


    function colorAtLength(length) {
        return '#' + bucketRainbow.colourAt(bucketMapping[length]);
    }

    function drawPoint(sampleName, sampleLength, hexColor, intensityArray, isPeak) {
        highlightPointBackground(sampleName, sampleLength, isPeak);

        var context = mainCanvas.getContext("2d");

        context.beginPath();

        var x = colPositions[sampleLength - minColumn] - xSpacingPx;

        // We bound by maxColumn even though data goes beyond that.
        if (sampleLength > maxColumn)
            return;
        x = x + xSpacingPx / 2;
        var intensity = intensityArray[sampleName][sampleLength];


        context.strokeStyle = hexColor;
        context.fillStyle = hexColor;
        var y = displayRow[sampleName].yMiddle;


        context.arc(x, y, mapDiameter(intensity) + 1, 0, 2 * Math.PI);
        context.stroke();
        context.fill();
        // hits all backgrounds at the moment, wasteful?
        // highlightPointBackground(sampleName, sampleLength, isPeak);

    }

    function highlightPointBackground(sampleName, sampleLength, isPeak) {
        if (sampleLength > maxColumn)
            return;
        // var c = document.getElementById("mainCanvasBackground" + canvasId);
        var context = mainCanvas.getContext("2d");

        // var context = c.getContext("2d");

        var x = colPositions[sampleLength - minColumn] - xSpacingPx;
        var y = displayRow[sampleName].y;
        // var ySpacingPx = 12;
        // var xSpacingPx = 12;
        var hexColor;
        if (isPeak) {
            //hexColor = "#e6e6e6";
            hexColor = '#ff0000';
        } else {
            hexColor = "white";
        }

        context.beginPath();
        context.rect(x + 1, y + 1, xSpacingPx - 1, ySpacingPx - 1);
        context.strokeStyle = hexColor;
        context.fillStyle = hexColor;
        context.lineWidth = 1;
        context.fill();
    }

    function drawPoints(intensityArray) {
        // hits[sample_name]=[[musat length, number of reads]]

        // minColumn  and maxColumn are X axis range
        //
        // x is sat length
        // y is sample name
        var rainbow = new Rainbow();
        rainbow.setSpectrum("black", "violet", "indigo", "blue", "green", "yellow", "orange", "red");
        rainbow.setNumberRange(0, 100);
        mainCanvas = document.getElementById(canvasName);

        for (var sampleName in sampleDataArray) {
            for (var i = 0; i < sampleDataArray[sampleName].length; i++) {
                var sampleLength = sampleDataArray[sampleName][i][0];


                var hexColor;
                // sampleDataArray[sample_name]=[[musat length, number of reads]]
                var isPeakPoint = isPeak(primerName, sampleName, sampleLength);
                if (isPeakPoint) {
                    hexColor = colorAtLength(sampleLength);
                    //hexColor = "red";
                } else {
                    hexColor = '#000000';
                }
                drawPoint(sampleName, sampleLength, hexColor, intensityArray, isPeakPoint);
            }
        }
    }

    that.updatePoint = function (isPeak, sampleName, alleleLength) {
        if (sampleDataArray[sampleName] === undefined) {
            return;
        }
        var hexColor;
        if (isPeak) {
            hexColor = colorAtLength(alleleLength);
        } else {
            hexColor = '#000000';
        }
        drawPoint(sampleName,
            alleleLength,
            hexColor,
            intensityArray,
            isPeak);

    }

    function setupCanvas() {
        $('#' + canvasName).css({
            'border-width': '1px',
            'border-style': 'solid',
            'border-color': '#000000'
        })

        $('#' + 'hit_bars' + canvasId).css({
            'border-width': '1px',
            'border-style': 'solid',
            'border-color': '#000000'
        });

    }

    function setupVerticalSpacing() {
        var length;
        if (sampleNameArray == null) {
            length = 1;
        } else {
            length = sampleNameArray.length
        }
        for (var i = 0; i < length; i++) {
            var y = i * ySpacingPx + ySpacingPx / 2;
            var item = {};
            item.yMiddle = y;
            item.y = i * ySpacingPx;
            if (sampleNameArray === null) {
                displayRow['null'] = item;
            } else {
                displayRow[sampleNameArray[i]] = item;
            }
        }
    }

    function drawSampleNames() {
        if (sampleNameArray == null) {
            return;
        }
        var context = document.getElementById("sample_names" + canvasId).getContext("2d");
        context.fillStyle = 'black';


        for (var i = 0; i < sampleNameArray.length; i++) {
            context.font = "10px Arial";
            context.fillStyle = '#0000ff';
            var y = displayRow[sampleNameArray[i]].yMiddle;
            y = y + ySpacingPx / 4;
            context.fillText(sampleNameArray[i], 10, y);
        }
    }

    function drawLengthLabels() {
        var context = document.getElementById("length_labels" + canvasId).getContext("2d");
        context.fillStyle = 'black';
        context.rotate(90 * Math.PI / 180);
        var lengthCount = Math.abs(minColumn - maxColumn);

        for (var i = 0; i <= lengthCount; i++) {
            if (doDrawColumnArray[i]) {
                context.font = "10px Arial";
                context.fillStyle = '#0000ff';
                var x = 0;
                var xPos = colPositions[i] - xSpacingPx;
                var y = -1 * xPos - xSpacingPx / 5;
                context.fillText(minColumn + i, x, y);
            }
        }
    }

    function drawHorizontalGrid() {
        var context = document.getElementById(canvasName).getContext("2d");

        for (var sampleName in displayRow) {
            var y = displayRow[sampleName].yMiddle;
            y = y + ySpacingPx / 2;
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(xSize, y);
            context.lineWidth = 1;

            // set line color
            context.strokeStyle = '#d3d3d3';
            context.stroke();
        }
    }

    function drawVerticalGrid() {
        var gridLineCount = Math.abs(minColumn - maxColumn);

        var context = document.getElementById(canvasName).getContext("2d");

        for (var i = 0; i <= gridLineCount; i++) {
            // var startX = i * xSpacingPx;
            var startX = colPositions[i];
            var startY = 0;
            var endX = startX;
            var endY = ySize;

            context.beginPath();
            context.moveTo(startX, startY);
            context.lineTo(endX, endY);
            context.lineWidth = 1;

            // set line color
            context.strokeStyle = '#d3d3d3';
            context.stroke();
        }
    }

// Iterate over array. If self > two lower neighbors && > two upper neighbors
// and delta between self and either immediate neighbor is less than
// 10% of our value range, then call a local maxima.
// If we call a local maxima (exclusing the pixel percentage check) then skip evaluating
// the next two elements.

// verticalsums: length index: float
// output: array of floats
    function getExtrema(verticalSums) {
        var normalizedArray = [];
        var i;
        for (i = minColumn; i <= maxColumn; i++)
            if (verticalSums[i] != null)
                normalizedArray[i] = verticalSums[i];
            else
                normalizedArray[i] = 0;

        var localMaxArray = [];
        for (i = minColumn; i <= maxColumn; i++) {
            var start = i - 2;
            var end = i + 2;
            if (start < minColumn)
                start = minColumn;
            if (end > maxColumn)
                end = maxColumn;
            var biggest = 0;
            for (var j = start; j <= end; j++)
                if (normalizedArray[j] > biggest)
                    biggest = normalizedArray[j];
            if (biggest == normalizedArray[i]) {
                //local max!
                localMaxArray.push(biggest);
                i = i + 2;
            }
        }

        return localMaxArray;

    }

    function drawSumBars(verticalSums) {

        var maxVertical = findMaxVertical(verticalSums);
        var scale = sumBarHeight / maxVertical;

        var extrema = getExtrema(verticalSums);
        var context = document.getElementById("hit_bars" + canvasId).getContext("2d");
        context.fillStyle = 'black';
        var barLineCount = Math.abs(minColumn - maxColumn);

        for (var i = 0; i <= barLineCount; i++) {
            var x = colPositions[i] - xSpacingPx;

            context.beginPath();
            //[x and y are defined by upper left] x,y,width,height
            var barHeight = verticalSums[i + minColumn] * scale;
            context.rect(x, sumBarHeight - barHeight, xSpacingPx - 2, barHeight);
            if ($.inArray(verticalSums[i + minColumn], extrema) == -1) {
                context.fillStyle = 'green';
            }
            else {
                context.fillStyle = 'red';
            }
            context.fill();
            context.lineWidth = 1;
            context.strokeStyle = 'black';
            context.stroke();
        }
    }


    function setGraphSizes() {
        // var x = (Math.abs(minColumn - maxColumn) + 1) * xSpacingPx;
        var x = 0;
        x = x + xSpacingPx * drawColumnCount;
        x = x + (xSpacingPx / 2) * skipColumnCount;
        var y;
        if (sampleNameArray == null) {
            y = ySpacingPx;
        } else {
            y = ySpacingPx * sampleNameArray.length;
        }
        xSize = x;
        ySize = y;
        var labelWidth = 100;

        var c = document.getElementById(canvasName);
        var context = c.getContext("2d");
        context.canvas.width = x;
        context.canvas.height = y;
        $('#mainCanvas' + canvasId).css({width: x, height: y});


        c = document.getElementById("mainCanvasBackground" + canvasId);
        context = c.getContext("2d");
        context.canvas.width = x;
        context.canvas.height = y;
        // fudge factor because I can't seem to squeeze the margin out of this thing.
        // thanks, css!
        $('#mainCanvasBackground' + canvasId).css({left: x * -1 - 2, top: -1, width: x, height: y});

        c = document.getElementById("sample_names" + canvasId);
        context = c.getContext("2d");
        context.canvas.width = labelWidth;
        context.canvas.height = y;
        $('#sample_names' + canvasId).css({left: x * -1 - 2, up: -10, width: labelWidth, height: y});

        c = document.getElementById("length_labels" + canvasId);
        context = c.getContext("2d");
        context.canvas.width = x;
        context.canvas.height = 30;
        $('#length_labels' + canvasId).css({width: x, height: 30});

        c = document.getElementById("hit_bars" + canvasId);
        context = c.getContext("2d");
        context.canvas.width = x;
        context.canvas.height = sumBarHeight;
        $('#graph_container' + canvasId).css({width: x + labelWidth});

        $('#hit_bars' + (canvasId)).width(x);
    }

    function sumVerticals(intensityArray) {
        var verticalSums = {};
        var barLineCount = Math.abs(minColumn - maxColumn);

        for (var sampleName in intensityArray) {
            for (var i = minColumn; i <= barLineCount + minColumn; i++) {
                if (intensityArray[sampleName][i] != null) {
                    if (verticalSums[i] != null) {
                        verticalSums[i] = intensityArray[sampleName][i] + verticalSums[i];
                    } else {
                        verticalSums[i] = intensityArray[sampleName][i];
                    }
                }
            }

        }
        return verticalSums;
    }

// when a column has two empty neighbors, it can be 'skipped', compressing it visually.
// multiple skip columns in a row will be consolidated into a single skip column
    function calculateSkipColumns(verticalSums) {
        // doDrawColumnArray - which columns to not draw. Array index 0=minColumn
        // drawColumnCount - number of columns to draw
        // skipColumnCount - number of "half width" consolidated skip columns to draw
        // colPositions - the x position of each column
        // if(minColumn > 1000 || maxColumn > 2000) {
        //     var errString = "Column out of range - min: " + minColumn + " max" + maxColumn);
        //     alert(errString);
        //     throw errString;
        // }
        var barLineCount = Math.abs(minColumn - maxColumn);
        drawColumnCount = 0;
        skipColumnCount = 0;
        var skipCount = 0;
        var curX = 0;
        doDrawColumnArray = [barLineCount];

        for (var i = minColumn; i <= (barLineCount + minColumn); i++) {
            if (verticalSums[i] == null) {
                doDrawColumnArray[i - minColumn] = false;
                skipCount++;
                if (skipCount == 3) {
                    skipColumnCount++;
                    curX = curX + (xSpacingPx / 2);
                }
            } else {
                doDrawColumnArray[i - minColumn] = true;
                drawColumnCount++;
                // We'll draw two blank columns next to one another. Just not three.
                // We need to revise the last 1 or 2 calculations manually
                // Icky, but unavoidable.
                if (skipCount > 0 && skipCount < 3) {
                    drawColumnCount++;
                    var lastKnownCol = (i - minColumn) - 2;
                    doDrawColumnArray[lastKnownCol + 1] = true;
                    if (skipCount == 2) {
                        drawColumnCount++;
                        doDrawColumnArray[lastKnownCol] = true;
                        if (lastKnownCol > 1) {
                            curX = colPositions[lastKnownCol - 1] + xSpacingPx;
                        } else {
                            curX = xSpacingPx;

                        }
                        colPositions[lastKnownCol] = curX;
                    }
                    curX =  xSpacingPx;
                    if(lastKnownCol > 0) { // If we're at the first column, there's no previous to reference..
                        curX = colPositions[lastKnownCol] + curX;
                    }
                    colPositions[lastKnownCol + 1] = curX;
                }
                curX = curX + xSpacingPx;
                skipCount = 0;
            }
            colPositions[i - minColumn] = curX;
        }
    }


    function findMaxVertical(verticalSums) {
        var biggest = 0;
        for (var i in verticalSums) {
            if (verticalSums[i] > biggest) {
                biggest = verticalSums[i];
            }
        }
        return biggest;
    }

// return a point diamater of size 0 to 10 based on the the
// maximum number of hits in the data set
    function mapDiameter(num) {
        return (num / 17)
    }

    that.getSampleDataArray = function () {
        return sampleDataArray;
    };

    that.getSampleNameArray = function () {
        return sampleNameArray;
    };

}

export default GridGraph
