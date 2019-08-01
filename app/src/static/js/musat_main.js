// TODO: Find and replace all alert popups with calls that work with framework

"use strict"; // only need once per module if here

$(document).ready(function () {
    var main = new Main(); // this creates mu, so var main is not redundant
    mu.main = main;

    $('html,body').scrollTop(0); // Show Documentation page from the top
});

function Main() {
    var that = this;
    var PROJECT_DIRECTORY_KEYWORD = "projectDirectory";
    var RECENT_PROJECTS_KEYWORD = "recentProjectObj"; // holds array and number of recent projects to keep in array

    that.setup = function () {
        if (typeof (Storage) === "undefined") {
            alert("Local storage is not supported in your browser. Please update to an HTML5 compliant browser.");
            return;
        }
        if (mu === null || mu === undefined) {
            reset_mu();
        }
        var projectDirectory = getStoredDirectory(); // read from html buffer for this page
        setDirectory(projectDirectory);
        mutooltip.create();

    };
    that.setup();

    function getStoredDirectory() {
        var str = localStorage.getItem(PROJECT_DIRECTORY_KEYWORD);
        if (!str)
            return "";
        return str;
    }

    function setStoredDirectory(directoryName) {
        localStorage.setItem(PROJECT_DIRECTORY_KEYWORD, directoryName);
    }

    function setDirectory(dir_to_set) {
        var selectedDirectory = dir_to_set.trim();

        if (checkIsProjectDirectory(selectedDirectory)) { // update if directory is valid

            mu.projectDirectory = selectedDirectory;
            setStoredDirectory(selectedDirectory);
            muLoadData(); // lighter approach than muLoadInfo()
            setWorkingDirectory(); // call after we've loaded the data for this projectDir
            setRecentProjectObj(getRecentProjectObj(), selectedDirectory);
            mu.aSampleName.sort(sortByPopThenSample);

            mu.flow = new Flow(selectedDirectory);
            mu.explore = new Explore(selectedDirectory);
            mu.flow.refresh();

            $(".musat_dir_name").html(mu.projectDirectory); // 24Jun2017 class for multiple places we might want dir name to appear
            var pathname = selectedDirectory, shortName = pathname.split('\\').pop().split('/').pop();
            $(".musat_dir_shortname").html(shortName);
        }
        else if (!checkIsDirectory(dir_to_set)) { // call Step_1 to show the invalid dir
            mu.flow = new Flow(dir_to_set);
            mu.flow.getStepObject(1).showDir(dir_to_set);
        } else {
            mu.flow.click(1);
        }

        // show server version info in any element that has the class musat_server_version
        var server_version = muServerVersion();
        $(".musat_server_version").html(server_version);
    }

    function checkIsProjectDirectory(dir) {
        if (!checkIsDirectory(dir)) return false;

        var dirname = "Directory " + dir.trim();
        var noFastqs = "has no FASTQ files";
        var nonPairedFastqs = "does not appear to have R1 and R2 paired-end FASTQ files.";
        var AYS = "\n\nAre you sure you want to set it as Project Directory?";

        var oFastqs = getFastqFileListing(dir);
        if (!oFastqs || $.isEmptyObject(oFastqs))
            return confirm(dirname + " " + noFastqs + " or " + nonPairedFastqs + AYS);

        return true;
    }

// recent project methods
    function getRecentProjectObj() {
        var obj, rp = localStorage.getItem(RECENT_PROJECTS_KEYWORD);
        try {
            obj = JSON.parse(rp);
        } catch (e) {
            obj = initRecentProjectObj();
        }
        return obj;
    }

    function setRecentProjectObj(oRecentProjects, dir_being_set) {
        if (!dir_being_set) return;
        if (!oRecentProjects || !oRecentProjects.aRP) oRecentProjects = initRecentProjectObj();
        var ix = oRecentProjects.aRP.indexOf(dir_being_set);
        if (ix > -1) oRecentProjects.aRP.splice(ix, 1); // if in there, remove it, we're promoting to top of heap

        oRecentProjects.aRP.push(dir_being_set); // place newest project at end of array

        if (oRecentProjects.aRP.length > oRecentProjects.maxsize) // if we've gotten too big, cut to size
            oRecentProjects.aRP.splice(0, oRecentProjects.aRP.length - oRecentProjects.maxsize);

        var jsonRecentProjects = JSON.stringify(oRecentProjects);
        localStorage.setItem(RECENT_PROJECTS_KEYWORD, jsonRecentProjects);
    }

    function initRecentProjectObj() {
        return {userDisplay: 5, maxsize: 20, aRP: []} // array of recent projects, first entry oldest, last most recent
    }

    function getRecentProjects() { // return array with most recent project first, least last, upto userDisplay in length
        var rProj = getRecentProjectObj();
        if(rProj == null) {
            return [];
        }
        var aDisplay = rProj.aRP.reverse();
        return aDisplay.slice(0, rProj.userDisplay);
    }

    function clearRecentProjectList() {
        var obj = initRecentProjectObj();
        var clearedProjects = JSON.stringify(obj);
        localStorage.setItem(RECENT_PROJECTS_KEYWORD, clearedProjects);
    }

// end recent project methods

    function setWorkingDirectory() { // work dir is where files are created. can be same as projectDirectory
        if (!mu.workingDirectory || mu.workingDirectory.trim() === "" || !checkIsDirectory(mu.workingDirectory)) {
            mu.workingDirectory = mu.projectDirectory;
        }
        $(".musat_working_dir_name").html(mu.workingDirectory);
    }

    function createWorkingDirectory() {
        if (!mu.workingDirectory || mu.workingDirectory !== mu.projectDirectory)
            return;

        var workdir = "musat_files";
        var msg = "";
        msg += "Click OK to create an Output directory named \"" + workdir + "\" underneath the Project directory, or";
        msg += "\n\nCancel to continue using the Project directory for Output as well as the location of FASTQ files.";
        var ok = confirm(msg);
        if (ok) {
            var fullDir = mu.projectDirectory + "/" + workdir;
            // TODO: create workdir in filesystem
            if (checkIsDirectory(fullDir)) {
                // todo: if created, move any existing muSat created files into the dir
                mu.workingDirectory = fullDir;
                setWorkingDirectory()
            }
        }
    }

    that.getRecentProjects = getRecentProjects;
    that.clearRecentProjectList = clearRecentProjectList;
    that.createWorkingDirectory = createWorkingDirectory;
    that.setDirectory = setDirectory;
}


