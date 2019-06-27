#!/usr/bin/env python
#

import subprocess
import sys
import os
import defaults
import trim
import merge
import step
import eventlet
from flask import render_template
from flask import send_file
from flask import request
from flask import Flask
import json
import filesystem_navigation
from flask_socketio import SocketIO
from flask import abort
import run_server
import options
import shutil
import create_locus_file
import user_loci_calls

app = Flask(__name__)

js_dir_list = None
css_dir_list = None
fonts_dir_list = None


def generate_version_string():
    internal_mod_flag = "3"  # can change to tell if non-committed changes are being tested
    try:
        label = subprocess.check_output(["git",
                                         "rev-list",
                                         "--all",
                                         "--count"])
    except:
        label = 'unavailable'

    return 'flask version 0.1.' + internal_mod_flag + ' (commit count:' + \
           label.strip() + \
           ')'


def graph_width():
    return 400


# serve javascript files, searches all directories named "js"
@app.route('/static/<javascript_file>.js')
def serve_static_javascript(javascript_file):
    for directory in js_dir_list:
        for file in os.listdir(directory):
            if file == javascript_file + ".js":
                return send_file(os.path.join(directory, file))


# serve css files, searches all directories named "css"
@app.route('/static/<css_file>.css')
def serve_static_css(css_file):
    for directory in css_dir_list:
        for current_file in os.listdir(directory):
            if current_file == css_file + ".css":
                return send_file(os.path.join(directory, current_file))
            if current_file == css_file + ".map":
                return send_file(os.path.join(directory, current_file))


@app.route('/jstree_directory')
def jstree_directory_listing():
    new_root = request.args.get('new_root')

    parent = request.args.get('parent')
    return json.dumps(filesystem_navigation.jstree_list_directory(parent, new_root))


# List all fastq files in a directory.
# data returned is parsed according to illumina standard filename:
#     Illumina FASTQ files use the following naming scheme:
#     <sample name>_<barcode sequence>_L<lane (0-padded to 3 digits)>_R<read number>_<set number (0-padded to 3 digits>.fastq.gz
#     For example, the following is a valid FASTQ file name:
#     NA10831_ATCACG_L002_R1_001.fastq.gz
# returns a json object list:
# "HiMaWaA89":{
# "lane":1,
# "set":"001",
# "name":"HiMaWaA89",
# "R2":true,
# "sequence":"S220",
# "filename":"HiMaWaA89_S220_L001_R1_001.fastq.gz",
# "R1":true
# },
@app.route('/fastq_directory')
def fastq_directory_listing():
    # directory = request.args.get('directory')
    # directory = os.path.normpath(directory)

    return json.dumps(filesystem_navigation.fastq_list_directory(process_directory()))


@app.route('/is_directory')
def is_directory():

    if os.path.isdir(process_directory()):
        return json.dumps(True), 200, {'ContentType': 'application/json'}
    else:
        return json.dumps(False), 404, {'ContentType': 'application/json'}

#  Utterly untested
@app.route('/create_directory')
def mk_directory():

    if os.path.mkdir(process_directory()):
        return json.dumps(True), 200, {'ContentType': 'application/json'}
    else:
        return json.dumps(False), 404, {'ContentType': 'application/json'}

@app.route('/is_file')
def is_file():

    if os.path.isfile(process_file()):
        return json.dumps(True), 200, {'ContentType': 'application/json'}
    else:
        return json.dumps(False), 404, {'ContentType': 'application/json'}


@app.route('/get_file')
def get_file():
    fileName = process_file()
    if not os.path.isfile(fileName):
        return json.dumps(False), 404, {'ContentType': 'application/json'}
    with open(fileName, "r") as f:
        content = f.read()
    return content


# return json in the format [ [filename, filesize, seconds since epoch], .. ]
@app.route('/directory_listing')
def directory_listing():
    # directory = request.args.get('directory')
    # directory = os.path.normpath(directory)

    return json.dumps(filesystem_navigation.list_directory(process_directory()))


# TODO: Much redundancy in these "remove" calls
@app.route('/remove_full_sample')
def remove_full_sample():
    # directory = request.args.get('directory')
    # directory = os.path.normpath(directory)
    filesystem_navigation.remove_full_sample(process_directory())
    return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}


@app.route('/remove_trim_files')
def remove_trim_files():
    # directory = request.args.get('directory')
    # directory = os.path.normpath(directory)
    filesystem_navigation.remove_trim_files(process_directory())
    return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}


@app.route('/remove_merge_files')
#  TODO: test this
def remove_merge_files():
    # directory = request.args.get('directory')
    # directory = os.path.normpath(directory)
    filesystem_navigation.remove_merge_files(process_directory())
    return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}


@app.route('/remove_files_for_step')
def remove_files_for_step():
    step.remove_files_for_step(process_directory(), request.args.get('step_number'))
    return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}


# args: filename

@app.route('/create_file', methods=['POST'])
def create_file():
    user_file_name = request.form['file'];
    user_file_name = os.path.normpath(user_file_name)
    payload = request.form['payload']
    # user_file_name= os.path.join(directory,"user_input_file_allelecalls.txt")
    user_file = open(user_file_name, "w+")
    user_file.write(payload)
    user_file.close()
    return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}


@app.route('/version')
def hello_server():
    return generate_version_string()


@app.route('/trim')
def do_trim():
    directory = request.args.get('directory')
    try:
        retval = trim.trim(directory)
    except Exception as e:
        return str(e), 500
    return retval


@app.route('/trim/path')
def get_trim_invocation():
    # TODO: Untested? was missing process_directory()
    try:
        retval = trim.get_trim_invocation(process_directory())
    except Exception as e:
        return str(e), 500
    return retval


@app.route('/merge')
def do_merge():
    retval = merge.merge(None, process_directory())
    return retval, 200


@app.route('/step')
def get_current_step():
    directory = process_directory()
    if not os.path.isdir(directory):
        return str(0), 200
    else:
        retval = step.get_current_step(directory)
        # except Exception as e:
        #     return str(e), 500
        return str(retval), 200


@app.route('/merge/path')
def get_merge_invocation():
    # TODO: Untested? was missing process_directory()
    try:
        retval = merge.get_merge_invocation(process_directory())
    except Exception as e:
        return str(e), 500
    return retval, 200


# GET /bin/create_locusfile.py?args=/Users/joe/bathwater_data/MergeFullRun.assembled.fastq+/Users/joe/bathwater_data/TG_MS1_AlleleCalls.txt+TGCACCCGTGTTCAATTTC+CACGGTGTCCAGAAATGCC HTTP/1.1" 200 -

@app.route('/create_locus_file')
def create_locus_file_endpoint():
    directory = process_directory()
    input_file = request.args.get('input_file')
    locus_name = request.args.get('locus_name')
    forward_primer = request.args.get('forward_primer')
    reverse_primer = request.args.get('reverse_primer')
    numreads, numsamps = create_locus_file.create_locus_file(directory, input_file, locus_name, forward_primer,
                                                             reverse_primer)
    return json.dumps([locus_name, numreads, numsamps]), 200, {'ContentType': 'application/json'}
    # TODO: Uncomment for production
    # try:
    #     numreads, numsamps = create_locus_file.create_locus_file(directory,input_file,locus_name,forward_primer,reverse_primer)
    #     return json.dumps([locus_name, numreads,numsamps]),200, {'ContentType':'application/json'}
    # except Exception as e:
    #     return str(e), 500
    # placeholder
    # Track the input file the user picked so we can regen the table
    # for display. Re-writes on each call here, which is harmless but wasteful.



@app.route('/bin/<script_name>')
def execute(script_name):
    return run_server.run_process_with_request_args(script_name)


@app.route('/')
def display_root():
    return render_template('/top_level.html')


@app.route('/template/<file>')
def usat_template(file):
    print("rendering template: " + '/templates/' + file)
    return render_template('/' + file)


@app.route('/userexit')
def user_exit():
    print("Exiting due to user triggered event...")
    sys.exit(0)


@app.route('/save_calls', methods=['POST'])
def save_calls():
    print ("Saving calls to " + request.form['filename'] + "....")
    # Using "filename" in case we may ever want to have multiple call files.
    return user_loci_calls.save_calls(request.form['calls'],
                                      request.form['working_directory'],
                                      request.form['filename'])


@app.route('/load_calls')
def load_calls():
    retval = user_loci_calls.load_calls(request.args.get('working_directory'),
                                        request.args.get('filename'),
                                        json.loads(request.args.get('calls')))

    return retval




@app.route('/automatic_calls')
def automatic_calls():
    retval = user_loci_calls.automatic_calls(request.args.get('working_directory'))

    return retval


@app.route('/remove_locked_out_alleles')
def remove_locked_out_alleles():
    user_calls = request.args.get('calls')
    user_calls_object = json.loads(user_calls)
    return json.dumps(user_loci_calls.remove_locked_out_alleles(request.args.get('working_directory'),
                                                     request.args.get('filename'),
                                                     user_calls_object))

@app.route('/options',methods=['POST'])
def save_options():
    def save_options():
        jsonData = request.get_json()
        directory = jsonData.pop('directory',None)
        directory = os.path.normpath(directory)

        f = open(os.path.join(directory,'options.json'), 'w')
        f.write(json.dumps(jsonData,indent=3))
        return json.dumps(True)

@app.route('/options')
def load_options():
    OPTIONS_FILE = 'options.json'
    directory = request.args.get('directory')
    if directory is None:
        abort(404)

    working_directory_options = os.path.join(directory, OPTIONS_FILE)
    try:
        f = open(working_directory_options, 'r')
    except IOError as e:
        defOptionsFile = 'default.' + OPTIONS_FILE
        print("Creating options template from " + defOptionsFile + " in " + working_directory_options)
        try:
            # changing to use default.options.json from options.json.example
            # shutil.copyfile(OPTIONS_FILE+'.example',working_directory_options)
            shutil.copyfile(defOptionsFile, working_directory_options)
            f = open(working_directory_options, 'r')
        except IOError as e:
            print("Attempted to create options.json in an invalid directory:" + working_directory_options)
            abort(404)

            # TODO: Setup and check for options in target directory, put in a proper HTML type warning.
    # Right now we do this silently...
    # e.g.: if you point at a directory and hit "set" or "next" on the first step,
    # it will observe that you're missing an options.json, and give you a one-click chance to
    # create an example options file in the chosen directrory by copying the existing options file to
    # said directory.

    return f.read()


@app.route('/save_server', methods=['POST'])
def save_server():
    print ("Saving data to " + request.form['filename'] + "....")
    try:
        f = open(request.form['filename'], 'w')
        f.write(request.form['payload'])
    except IOError as e:
        errmsg = "err: {1} ({0})".format(e.errno, e.strerror)
        print errmsg
        return errmsg
    return json.dumps(True)


# @app.route('/<path:page_file_name>')
# def display_static_page(page_file_name):
#     print ("Rendering file: " + server_root() + page_file_name)
#     return send_file(server_root() + page_file_name)


# processes post;
# /saveas/filename
# untested
@app.route('/saveas/<filename_with_path>')
def save_file(filename_with_path):
    contents = (request.form['contents'])
    with open(filename_with_path, 'w') as file_:
        file_.write(contents)


def usage():
    print("usage: server.py [ <portnum> ] [ <server_root_dir> ] [ <bin_root_dir> ]")
    print("       defaults are %d './' './bin'" % DEFAULT_PORT)
    sys.exit(0)


def verify_dir(directory_name):
    if not os.path.isdir(directory_name):
        sys.stderr.write("\"" + directory_name + "\" is not a directory.\n")
        usage()


def find_dirs(path, match):
    dirlist = []
    for root, dirs, files in os.walk(path):
        for dir in dirs:
            full_dir = os.path.join(root, dir)
            if dir == match:
                dirlist.append(full_dir)
    return dirlist


def process_directory():
    directory = request.args.get('directory')
    return os.path.normpath(directory)


def process_file():
    fileName = request.args.get('file')
    fileName = os.path.normpath(fileName)
    return fileName


# TODO: Joe in process 2/23/17
# def process_file_path(file_path_request_arg)
#     fpath =  request.args.get(file_path_request_arg)


# not used; placeholder for if/when we want to use it
# @socketio.on('message')
# def handle_message(message):
#     print('received message: ' + message)
#
# @socketio.on('my event')
# def handle_my_custom_event(json):
#     print('received json: ' + str(json))


if __name__ == '__main__':
    js_dir_list = find_dirs('.', "js")
    css_dir_list = find_dirs(".", "css")
    fonts_dir_list = find_dirs(".", "fonts")
    # print "arg: " + sys.argv[1]
    # print "argc: %d" % len(sys.argv)
    port = defaults.DEFAULT_PORT
    nargs = len(sys.argv)
    if nargs > 1:
        if sys.argv[1] == "help" or sys.argv[1] == "-h" or sys.argv[1] == "--help":
            usage()
        port = int(sys.argv[1])
        if nargs > 2:
            options.server_root(sys.argv[2])
        if nargs > 3:
            options.bin_root(sys.argv[3])

    # verify_dir(sys.argv[1])
    # verify_dir(options.server_root())
    # verify_dir(options.bin_root())

    print(generate_version_string() + "\n")
    print("flask server started: Port " + str(port) + ".")
    socketio = SocketIO(app, async_mode="threading")
    # socketio=None


    if socketio is not None:
        run_server.set_socketio(socketio)
        socketio.run(app, host='0.0.0.0', debug=True, port=port, use_reloader=False)
    else:
        app.run(host='0.0.0.0', debug=True, port=port, use_reloader=False)
