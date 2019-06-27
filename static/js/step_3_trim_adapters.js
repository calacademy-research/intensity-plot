function Step3() {

    var trim_files = [];

    function show() {
       updateDisplay();
    }

    function getTrimFileNames() {
        trim_files = [];
        var directoryListing = getDirectoryListing();
        for (var i = 0; i < directoryListing.length; i++) {
            if (directoryListing[i][0].startsWith("FullSampleRun_trim")) {
                trim_files.push(directoryListing[i][0]);
            }
        }
        return trim_files;
    }
    // check for FullSampleRun_trim_R1.fq and FullSampleRun_trim_R2.fq
    function checkForTrimFiles() {
        var directoryListing = getDirectoryListing();
        for (var i = 0; i < directoryListing.length; i++) {
            // TODO: hardcoded; see options
            if (directoryListing[i][0].startsWith("FullSampleRun_trim")) {
                return directoryListing[i];
            }
        }
        return false;
    }
    function updateDisplay() {
        var filesExist = checkForTrimFiles();
        if (filesExist !== false) {
            $("#step_3_trimming_complete").removeClass('hidden');
            //TODO: grey out any action buttons.
            setButtonStates(true);

        } else {
            $("#step_3_trimming_complete").addClass('hidden');
            setButtonStates(false);
        }

    }

    function initializeResultsObj() {
        mu.trimResults = {files: [], log: ""};
        mu.trimResults.createStarted = Date.now(); // millisecs. for readable d = new Date(milli); d.toDateString()
        mu.trimResults.createEnded = Date.now();
        mu.trimResults.secsToCreate = 0; // this will indicate an error if written out as 0
    }
    function updateResultsOnSuccess() {
        getTrimFileNames();
        updateDisplay();
        mu.trimResults.files = trim_files.slice();
        mu.trimResults.log = $("#run_progress_content").text();
        mu.trimResults.createEnded = Date.now();
        mu.trimResults.secsToCreate = parseInt( (mu.trimResults.createEnded - mu.trimResults.createStarted) / 1000 ) + 1;
        muSaveData();
    }

    function doTrim(event) {
        var pgm = "/trim";
        var payload = {"directory": mu.projectDirectory};
        initializeResultsObj();
        getUrlWithData(pgm,
            payload,
            function (data) { // called on success
                updateResultsOnSuccess();
            }
        );
    }
    this.doTrim = doTrim;

    function removeExistingFiles() {
        if (! confirmFileRemoval()) return;
        $.ajax({
            type: "GET",
            url: '/remove_trim_files',
            data: {
                "directory": mu.projectDirectory
            },
            dataType: "text",
            error: handleAjaxError,
            success: function (data) { // called on success
                updateDisplay();
            },
            async: false
        });
    }
    this.removeExistingFiles = removeExistingFiles;


    function setButtonStates(samplesExist) {

        $('#Step3 #create_button').prop('disabled', samplesExist); // don't allow merge if samplesExist
        $('.step3 .nextButton').prop('disabled', ! samplesExist); // do allow next btn if samplesExist

        /*
        if ( samplesExist ) {
            $('.step3').find('#create_button').prop('disabled', true);
            $('.step3').find('.nextButton').prop('disabled', false);

        } else {
            $('.step3').find('#create_button').prop('disabled', false);
            $('.step3').find('.nextButton').prop('disabled', true);
        }
        */
    }

    this.showLog = function() {
        showObjRunLog("Trimmomatic run", mu.trimResults);
    };

    this.show = show;

}