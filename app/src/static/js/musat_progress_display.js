
// Handles only the visual aspects of the progress bar. 
// invoked only via flow.
function ProgressDisplay(startLevel) {
    var that = this;

    // essentially moves the "active dot" from one step to another.
    this.setCurrent = function (currentStep) {
        // unhighlight previous step
        $(".steps-container").find(".bs-wizard-dot-center-active").removeClass("bs-wizard-dot-center-active")
        // highlight current step
        step = $("#step" + currentStep);

        step.find(".bs-wizard-dot-center").addClass("bs-wizard-dot-center-active");

        $(".steps-pages").find(".step-content").each(function () {
            $(this).hide();
        });
        $("#" + currentStep + ".step-content").show();


    };
    // advances the "progress" bar" to this step.
    this.setComplete = function (completedStep) {
        //
        // get element count
        if(completedStep > mu.STEPS)
            completedStep = mu.STEPS
        stepsCount = $(".bs-wizard-step").length;
        for (var i = 1; i <= stepsCount; i++) {
            if (i < completedStep) {
                $(".bs-wizard-step#step" + i).removeClass("active").removeClass("disabled").addClass("complete");
            } else if (i > completedStep) {
                $(".bs-wizard-step#step" + i).removeClass("active").removeClass("complete").addClass("disabled");
            } else {
                $(".bs-wizard-step#step" + i).removeClass("disabled").removeClass("complete").addClass("active");
            }
        }

    };

    this.getCurrent = function () {
        return parseInt($(".bs-wizard-step.active").attr('id').match(/\d+/)[0]);
    };

    this.next = function (thisPage) {
        current = that.getCurrent();
        if (thisPage + 1 > current) {
            that.setComplete(thisPage + 1);
        }
        that.setCurrent(thisPage + 1);

    };

    this.prev = function (thisPage) {
        that.setCurrent(thisPage - 1);

    };

    this.click = function (step) {
        that.setCurrent(step);
    };


    that.setCurrent(startLevel);
    that.setComplete(startLevel);

}