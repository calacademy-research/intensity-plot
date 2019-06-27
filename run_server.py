from flask import request
import subprocess
import sys
import options
import string
import time

socketio = None


def set_socketio(socketio_new):
    global socketio
    socketio = socketio_new

    # socketio.emit('pop', "{ hello: 'world' }");


def send_server(run_string):
    global socketio
    print(run_string)
    printable = set(string.printable)
    no_errors = filter(lambda x: x in printable, run_string)
    if socketio is not None:
        socketio.emit('run_log', no_errors)
    print("Emmtted:" + no_errors)


def run_process_with_request_args(script_name):
    args = request.args.get('args')
    do_send_string=False
    if(args.endswith(',printing=true')):
        do_send_string = True
        args=args[:-14]
    arg_array = [options.bin_root() + script_name] + args.split(" ")
    try:
        results = run_process(arg_array, None, do_send_string)
    except subprocess.CalledProcessError as e:
        results = 'Error, unable to run ' + options.bin_root() + script_name + args.split(" ") + ":" + e.output

        sys.stderr.write(results + "\n")
    return results


def run_process(arg_array, directory=None,  server_echo=False):
    global socketio


    bin = arg_array[0]
    if socketio is not None:
        send_server('running ' + bin + "\n")
    # print("Executing script:" + arg_array)
    # pass universal_newlines=True so Carriage Return interpreted as newline
    try:
        if directory is None:
            p = subprocess.Popen(arg_array, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, universal_newlines=True)
        else:
            p = subprocess.Popen(arg_array, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, cwd=directory, universal_newlines=True)

        results = ""
        stdout_lines = iter(p.stdout.readline, "")
        for line in stdout_lines:
            if server_echo:
                send_server(line)
            results += line
        # retcode = p.poll()
    except Exception as e:
        send_server("Run aborted due to error:  " + e.strerror)
        send_server("Current working directory: " + directory)
        send_server("Command:                   " + bin)
        if socketio is not None:
            socketio.emit('done', bin)
        raise Exception(e.strerror)
    if socketio is not None:
        socketio.emit('done', bin)
    return results


