// We save options in a json object named "options".
// this is stored in Html5 local storage.

// TODO: comment about the differnce between HtmlOptions and Options.
// I think the htmlOptions popualtes the options tab and options is the readable/wriaeable hash table
// TODO: integrate these into their screens where appropiate (e.g.: FullSamplerun.r1 is hardcoded)
"use strict";

// to invoke with a callback:
// onclick="htmlOptions.initFileBrowserFromFilePath('musat_dir',$('#musat_dir').val(),mu.flow.getStepObject(1).fileBrowserCallback)">
// not used
// function fileBrowserCallback(filepath) { // just set the value in the proper place user still needs to click Set
//     var dir = getDirFromPath(filepath); // we want only dir, so if user dblclicked a file use dir it's in
//     $("#musat_dir").val(dir);
//     //mu.main.setDirectory(dir);
// }

function Options() {
    // setup
    var optionsJson;
    var optionsAreValid = true;

    this.saveOptions = function () {
        //   save options back to server
        optionsJson.directory = mu.projectDirectory;
        $.ajax({
            type: "POST",
            url: "/options",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(optionsJson),
            error: function (jqXHR, textStatus, errorThrown) {
                alert(textStatus + "\n" + errorThrown);
            }
        });
    };

    this.loadOptions = function () {
        $.ajax({
            type: "GET",
            url: '/options',
            data: {
                "directory": mu.projectDirectory
            },
            async: false,
            success: function (data) {
                optionsJson = JSON.parse(data);
            },
            error: function (data) {
                optionsAreValid = false;
            }
        });

    };


    this.setOption = function (category, optionName, optionValue) {
        optionsJson[category][optionName] = optionValue;
    };


    this.getOption = function (category, optionName) {
        if (optionsJson && optionsJson[category])
            return optionsJson[category][optionName];
        return null;
    };
    if (mu.projectDirectory.length > 0) {
        this.loadOptions();
    }

    this.getOptionsJson = function () {
        return optionsJson;
    };

    // called from main
    this.populateOptionsPage = function () {
        if (!optionsAreValid)
            return;

        var optionsString = '';
        for (var category in optionsJson) {
            optionsString = optionsString + ("<b>" + category.charAt(0).toUpperCase() + category.substr(1) + "</b><br/>")
            for (var item in optionsJson[category]) {
                var itemId = category + '_' + item;
                var value = optionsJson[category][item];
                optionsString = optionsString + ("<div class='option'>");
                optionsString = optionsString + ("&nbsp;&nbsp;&nbsp;" + item + ":&nbsp;&nbsp;")
                optionsString = optionsString + ("<input id=\"" +
                    itemId +
                    "\"" +
                    " type=\"text\"" +
                    " size=\"" + Math.max(60, value.length + 2) + "\"" +
                    " value = \"" +
                    value +
                    "\"" +
                    ">");


                if (item.toLowerCase().includes('path') ||
                    item.toLowerCase().includes('directory')) {
                    optionsString = optionsString + (htmlOptions.createFileBrowserHtml(itemId));
                }
                optionsString = optionsString + ("</div>");

            }
            optionsString += "<br/>";
        }
        $("#options_rendered").html(optionsString); // change from append to html and use div innside of #options

    };
    // TODO: in options.html add a class for the option headers, and add hidden tag to them
    //  when populate, above, is hit, then unhidden them.
    // also invalidate the "options" menu item". Acitally mostly that.
    this.clearOptionsPage = function () {
        $('.option').remove();
    };

}

function HtmlOptions(options) {
    this.options = options;
    var curDirectory = null;

    function hitAll(target) {
        var optionsJson = options.getOptionsJson();
        for (var category in optionsJson) {
            for (var item in optionsJson[category]) {
                target(category, item);
            }
        }
    }

    this.saveHtmlOptions = function () {
        hitAll(function (category, item) {
            var optionsJson = options.getOptionsJson();
            if (category !== "directory") {
                optionsJson[category][item] = $("#" + category + '_' + item).val();
            }
        });

        this.options.saveOptions();
    };

    this.reloadHtmlOptions = function () {
        options.loadOptions();
        hitAll(function (category, item) {
            var optionsJson = options.getOptionsJson();
            $("#" + category + '_' + item).val(optionsJson[category][item]);
        });
    };

    this.clearRecentProjectList = function () {
        if (confirm("Clear the list of Recent Projects available in Step 1.1")) {
            mu.main.clearRecentProjectList();
        }
    };

    // allow a directory path or a filepath to initialize the file browser
    this.initFileBrowserFromFilePath = function (id, filepath, callback) {
        var directory = getDirFromPath(filepath); // trim last part of path if fullpath not dir
        this.initFileBrowser(id, directory, callback);
    };

    this.initFileBrowser = function (id, directory, callback) {
        var useDir = directory.trim();

        if (useDir === "")
            useDir = ".";

        if (!checkIsDirectory(useDir))
            useDir = "/";

        createFileBrowser(id, useDir, callback);
    };
    // TODO: Feature - restrict to picking file or directory
    // TODO: test on windows
    // TODO: see if can change open/close icons so a person with normal vision can see them:
    // notes from a google group search
    //    $('#your-tree').on('open_node.jstree', function (e, data) { data.inst.set_icon(data.node, "glyphicon glyphicon-folder-open"); });
    //    $('#your-tree').on('close_node.jstree', function (e, data) { data.inst.set_icon(data.node, "glyphicon glyphicon-folder-close"); });

    function createFileBrowser(id, directory, callback) {
        var $jstree = $("#jstree_" + id);
        var $popup = $("#popup_" + id);

        function showCurDirectory(id, directory) {
            $("#curdir_" + id).html("&nbsp;&nbsp; " + directory);
        }

        $popup.css("visibility", "visible");
        $popup.css("opacity", "1").css("z-index", "1000");

        $jstree.jstree({
            'core': {
                'data': {
                    'url': function (node) {

                        if (directory !== undefined && node.text === undefined) {
                            curDirectory = directory;
                            showCurDirectory(id, curDirectory);
                            return "/jstree_directory?new_root=" + directory;
                        } else {
                            if (node.id === "#") {
                                return "/jstree_directory";
                            } else {
                                return "/jstree_directory?parent=" +
                                    encodeURIComponent(node.id) +
                                    "&new_root=" +
                                    curDirectory;
                            }
                        }
                    },

                    'type': 'GET',
                    'dataType': 'JSON',
                    // 'contentType': 'application/json',
                    "error": function (jqXHR, textStatus, errorThrown) {
                        alert(errorThrown.message)
                    }
                },
                "error": function (jqXHR, textStatus, errorThrown) {
                    alert(jqXHR.error + ": " + jqXHR.reason)
                }
            }

        });
        $jstree.dblclick(function (event) {
            $jstree.off();
            var node = $(event.target).closest("li")[0];
            if ($jstree.jstree(true).is_parent(node) || (node.innerText === "..") ) {
                $("#jstree_" + id).jstree("destroy");
                createFileBrowser(id, node.id, callback);
            } else {
                processSelect(id, node, callback);

            }

        });

    }

    function processSelect(id, node, callback) {
        // close popup window and populate the field.
        $("#" + id).val(node.id); // move before callback so it can deal with the val if desired
        var $popup = $("#popup_" + id);
        if (callback !== undefined) {
            callback(node.id);
        }
        $popup.css("visibility", "hidden");
        $popup.css("opacity", "0");
        $("#jstree_" + id).jstree("destroy");
    }

    this.selectFileButton = function (id) {
        //    hit when "select" is invoked in overlay
        var jstree = $("#jstree_" + id);

        var selected = jstree.jstree('get_selected');
        if (selected.length > 1) {
            alert("Please select a single item");
        }
        if (selected.length < 1) {
            alert("Nothing selected");
        }
        selected = selected[0];
        var node = jstree.jstree(true).get_node(selected)
        processSelect(id, node);

        // alert(selected)
    }
    this.clearFileBrowser = function (id) {
        $("#popup_" + id).css("visibility", "hidden").css("opacity", "0");
        $("#jstree_" + id).jstree("destroy");

    };
    //     // <button class="btn" onclick="htmlOptions.initFileBrowser('musat_dir',$('#musat_dir').val(),main.setDirectory)">Browse </button>

    //// will set the result of the pop up into the input with the id in "inputId"
    // Currently only used in "options"
    this.createFileBrowserHtml = function (inputId, callback) {
        var htmlString = "", htmlClk = "$('#' + id).val(node.id)";

        if (callback === undefined) {
            htmlString += "<button  onclick=\'htmlOptions.initFileBrowser(\"" +
                inputId +
                "\",mu.projectDirectory)\'>Set Path</button>";

        } else {
            htmlString += "<button  onclick=\'htmlOptions.initFileBrowser(\"" +
                inputId + "\",mu.projectDirectory," + callback +
                ")\'>Set Path</button>";
        }

        htmlString += '<div id=\"popup_' + inputId + '\" class=\"overlay\">';
        htmlString += "<div class=\"popup\">";
        htmlString += "<h2>Choose file or folder</h2>";

        //                    <a class="btn select-file-button"
        //onclick="htmlOptions.selectFileButton('musat_dir')">Select</a>

        htmlString += "<a class=\"close_top\" onclick=\'htmlOptions.clearFileBrowser(\"" +
            inputId +
            "\")\'>&times;</a>";

        htmlString += "<a class=\"close_bottom\" onclick=\'htmlOptions.clearFileBrowser(\"" +
            inputId +
            "\")\'>&times;</a>";

        htmlString += "<a class=\"btn select-file-button\" onclick=\'htmlOptions.selectFileButton(\"" +
            inputId +
            "\")\'>Select</a>";

        htmlString += "<div><span id='curdir_" + inputId + "'><i>&lt;none&gt;</i></span>&nbsp;" +
            // "<span class='choose_dir' onclick='" +htmlClk+ "'>&#9989;</span>" + // comment out till figure click handler
            "</div>";

        htmlString += "<div class=\"content\">";
        htmlString += "<div id=\"jstree_" +
            inputId +
            "\"></div>";
        htmlString += "</div>";
        htmlString += "</div>";
        htmlString += "</div>";

        return htmlString;
    };

}

