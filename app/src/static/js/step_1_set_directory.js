
// TODO: doing "browse" when the current directory is invalid hoses the world
// TODO: hitting "set" causes you to warp to the most recent step. It should just pop up the blue banner
// TODO: when user sets dir from browser, check if FASTQ file exists. if not ask if user is sure this is the dir they want
// TODO: figure out what to do if Step 5 files exist but intermediates don't. User should be able to call alleles but can't now
function Step1() {

    function setup() {
        var tip = "Browse to a Project directory or Choose a Recent Project. " +
            "Click Set make this your Current Project.";
        mutooltip.add("#set_directory_button", tip);
    }

    function show() {
        showDir(mu.projectDirectory);
        setupRecentProjectSelect();
    }
    function showDir(currentDirectory) {
        setCurrentDirectoryInPage(currentDirectory);
        setButtonAndErrorStates(currentDirectory);
    }

    function setCurrentDirectoryInPage(dir) {
        // $('.step1').find("#current_directory").text(dir);
        if (checkIsDirectory(dir)) // only update if valid dir
            $("#musat_dir").val(dir);

        $(".step1_dir_name").html(dir); // class for multiple places we might want dir name to appear
        $('#prep_complete').html("&nbsp;"); // remove check mark from last project that might be there
    }
    function setButtonAndErrorStates(currentDirectory) {
        validDirectory = checkIsDirectory(currentDirectory);

        var $step1 = $('.step1');
        $step1.find('.nextButton').prop('disabled', !validDirectory);
        if (validDirectory) {
            $step1.find("#step_1_invalid_directory").addClass('hidden');
            $step1.find("#step_1_valid_directory").removeClass('hidden');

        } else {
            $step1.find("#step_1_invalid_directory").removeClass('hidden');
            $step1.find("#step_1_valid_directory").addClass('hidden');

        }
        // only allow work dir to be created if it is set to project dir
        $("#create_work_dir").prop('disabled', mu.workingDirectory !== mu.projectDirectory);
    }



    function dirFromSelect(sel) { // puts dir from select into input box, user still must press Set
        $("#musat_dir").val(sel.value);
    }

    function setupRecentProjectSelect() {
        if (!mu || !mu.main || !mu.main.getRecentProjects)
            return;
        var aRecents = mu.main.getRecentProjects(); // fill the select from the localStorage object
        var options = "";
        for (var p=0; p < aRecents.length; p++) {
            options += '<option value="'+ aRecents[p] + '">' + shortName(aRecents[p]) + '</option>';
        }
        $('#recentProjectSelect').html(options).prop('selectedIndex', -1); // -1 shows blank, 0 would show first entry

        function shortName(pathname) {
            return pathname.split('\\').pop().split('/').pop();
        }
    }

    this.show = show;
    this.showDir = showDir;

    this.dirFromSelect = dirFromSelect;

    setup();


//     $("#step_2_prerequsites").removeClass('hidden');
//     $("#step_2_prerequsites_directory").text(mu.projectDirectory);
//     //TODO: grey out any action buttons.
// } else {
//     $("#step_2_prerequsites").addClass('hidden');

}