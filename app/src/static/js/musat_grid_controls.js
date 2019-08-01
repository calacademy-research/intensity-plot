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








