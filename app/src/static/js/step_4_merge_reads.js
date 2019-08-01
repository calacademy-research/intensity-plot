function Step4() {

    var merge_files = [];

    function show() {
        updateDisplay();
    }

    function getMergeFileNames() {
        merge_files = [];
        var directoryListing = getDirectoryListing();
        for (var i = 0; i < directoryListing.length; i++) {
            if (directoryListing[i][0].startsWith("MergeFullRun")) {
                merge_files.push(directoryListing[i][0]);
            }
        }
        return merge_files;
    }
    // check for MergeFullRun
    function checkForMergeFiles() {
        var directoryListing = getDirectoryListing();
        for (var i = 0; i < directoryListing.length; i++) {
            // TODO: hardcoded; see options
            if (directoryListing[i][0].startsWith("MergeFullRun")) {
                return directoryListing[i];
            }
        }
        return false;

    }
    function updateDisplay() {
        //TODO: This should go off prerequesites file. See step 5 for example.

        var filesExist = checkForMergeFiles();
        if (filesExist !== false) {
            $("#step_4_merging_complete").removeClass('hidden');
            //TODO: grey out any action buttons.
            setButtonStates(true);

        } else {
            $("#step_4_merging_complete").addClass('hidden');
            setButtonStates(false);
        }

    }

    function initializeResultsObj() {
        mu.mergeResults = {files: [], log: ""};
        mu.mergeResults.createStarted = Date.now(); // millisecs. for readable d = new Date(milli); d.toDateString()
        mu.mergeResults.createEnded = Date.now();
        mu.mergeResults.secsToCreate = 0; // this will indicate an error if written out as 0
    }
    function updateResultsOnSuccess() {
        getMergeFileNames();
        updateDisplay();

        mu.mergeResults.files = merge_files.slice();
        mu.mergeResults.createEnded = Date.now();
        mu.mergeResults.secsToCreate = parseInt((mu.mergeResults.createEnded - mu.mergeResults.createStarted) / 1000) + 1;
        mu.mergeResults.log = $("#run_progress_content").text();

        setTimeout(function() { // need a little time for last text to get to the screen from the server
                var curtxt = $("#run_progress_content").text();
                if (curtxt.length > mu.mergeResults.log.length)
                    mu.mergeResults.log = curtxt;
                muSaveData();
            }, 1000);
    }

    function doMerge(event) {
        var pgm = "/merge";
        var payload = {"directory": mu.projectDirectory};
        initializeResultsObj();
        getUrlWithData(pgm,
            payload,
            function (data) {
                updateResultsOnSuccess();
            }
        );
    }
    this.doMerge = doMerge;

    function removeExistingFiles() {
        if (! confirmFileRemoval()) return;
        $.ajax({
            type: "GET",
            url: '/remove_merge_files',
            data: {
                "directory": mu.projectDirectory
            },
            dataType: "text",
            error: handleAjaxError,
            success: function (data) {
                updateDisplay();
            },
            async: false
        });
    }
    this.removeExistingFiles = removeExistingFiles;


    function setButtonStates(samplesExist) {

        $('#Step4 #merge_button').prop('disabled', samplesExist); // don't allow merge if samplesExist
        $('.step4 .nextButton').prop('disabled', ! samplesExist); // allow next if samplesExist

        /*
        if ( samplesExist ) {
            $('.step4').find('#merge_button').prop('disabled', true);
            $('.step4').find('.nextButton').prop('disabled', false);

        } else {
            $('.step4').find('#merge_button').prop('disabled', false);
            $('.step4').find('.nextButton').prop('disabled', true);
        }
        */
    }

    this.showLog = function() {
        showObjRunLog("Merge run", mu.mergeResults);
    };


    this.show = show;
}