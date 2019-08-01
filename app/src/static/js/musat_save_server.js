
// payload is a string
function saveServer(filename,payload) {
    //   save options back to server
    json_payload = {};
    json_payload['filename'] = filename;
    json_payload['payload']  = payload;

//    postUrl("/save_server")
    $.ajax({
        type: "POST",
        url: "/save_server",
        data: json_payload,
        error: function (jqXHR, textStatus, errorThrown) {
            // TODO: We're only getting the string 'error' out of the textStatus variable
            alert(textStatus + "\n" + errorThrown);
        }
    })
    //  TODO: This hack supports extracting the proper error. Something wrong here?
     .done(function(data) {
        if (data && data.startsWith("err:")) {
            alert(data);
        }
     })
}