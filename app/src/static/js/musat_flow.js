// Invoked from "setDirectory" which is also called as part of startup
// if it has been previously set in this browser (using browser storage).
// This object handles everything about control flow and tabs.
// Self populates the global reference object (mu.flow)

// TODO: Put a "remove all non-source data files" button
// TODO: When switching directories, we retain the old flow object, which shows bad state.
function Flow(workingDirectory) {
    var progressDisplay = {};
    // in setup, if working directory is defined, pull information to set
    // progress level. Update progress display object.

    // create a function to activate "next" buttons in the progress display as needed.
    // probably this belings in the progress display itself, but should be called from here.

    // 24May2016 JBH -- set things up for new project, make sure old project items removed (work-in-progress)
    // $("#musat_dir").text(projectDirectory);

    // TODO: add check for workingDirecotry not null
    //
    var serverSideStep;
    var curShowingStep;
    var javascripts = [];

    function setup() {
        // required because when we invoke an arbitrary step, it depends
        // on this variable being populated.
        mu.flow = this;
        projectDirectory = workingDirectory.trim();
        if (projectDirectory.slice(-1) !== '/') // canonical form is with ending slash
            projectDirectory += '/';

        setCurStepFromServer();
        progressDisplay = new ProgressDisplay(curShowingStep);
        javascripts[1] = new Step1();
        javascripts[2] = new Step2();
        javascripts[3] = new Step3();
        javascripts[4] = new Step4();
        javascripts[5] = new Step5();

        setupOptions();
        setupResultsObjects();
    }

    function setupOptions() {
        // TODO: This is ugly because these statement are order dependent
        // and should be intrinsic to the creation of "Options".
        // Also, these globals should be in mu object.
        options = new Options();
        htmlOptions = new HtmlOptions(options);
        if (checkIsDirectory(mu.projectDirectory)) {

            options.populateOptionsPage();
        } else {
            options.clearOptionsPage();

        }
    }
    function setupResultsObjects() { // 23Jun2017 JBH create the results obj once and only once
        if (! mu.oResults || $.isEmptyObject(mu.oResults)) mu.oResults = new Results_obj();
        if (! mu.oStats || $.isEmptyObject(mu.oStats)) mu.oStats = new Stats_obj(); // also setup the stats object that Results calls
    }

    this.getServerSideStep = function () {
        return serverSideStep;
    };

    // sets "curShowingStep" variable
    function setCurStepFromServer() {
        $.ajax({
            type: "GET",
            url: '/step',
            data: {
                "directory": projectDirectory
            },
            dataType: "text",
            error: handleAjaxError,
            success: function (data) {
                serverSideStep = data;
            },
            async: false
        });
        serverSideStep = parseInt(serverSideStep);
        if (serverSideStep === 0)
            serverSideStep = 1;
        else
            serverSideStep++;
        if (serverSideStep > mu.STEPS) {
            allStepsComplete();
        }

        curShowingStep = serverSideStep;


    }

    this.setCurStepFromServer = setCurStepFromServer;
    // Do this once the pipeline steps are complete.
    function allStepsComplete() {
        $('#menu_2_handle').removeClass('disabled');

    }
    // handle for the "next" button - what should it do after we're done with flow? we'll got to default Allele Caller
    function nextForLastStep() {
        $('#menu_2_a').tab('show');

        mu.explore.show('default');
        $('html,body').scrollTop(0); // since we probably scrolled to hit Next btn
    }

    function runStepJavascript(step) {
        if (javascripts[step] !== null) {
            javascripts[step].show();
        }
    }

    this.getStepObject = function (step) {
        return javascripts[step];
    };

    this.refresh = function () {
        if(curShowingStep > mu.STEPS) {
            curShowingStep = mu.STEPS;
        }
        progressDisplay.click(curShowingStep);
        runStepJavascript(curShowingStep);

    };

    this.next = function (thisPage) {
        curShowingStep = thisPage + 1;
        if (curShowingStep > mu.STEPS) {
            nextForLastStep();
        } else {
            progressDisplay.next(thisPage);
            runStepJavascript(curShowingStep);
        }
    };

    this.prev = function (thisPage) {
        curShowingStep = thisPage - 1;
        progressDisplay.prev(thisPage);
        runStepJavascript(curShowingStep);

    };


    this.click = function (step) {
        curShowingStep = step;
        progressDisplay.click(step);
        runStepJavascript(step);
    };


    setup();
}

