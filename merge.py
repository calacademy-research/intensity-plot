import os
import options
import run_server

def get_merge_invocation(directory):
    return get_merge_program(directory) + " " + options.get_option_by_caterogy('program_argument_sets', 'merge_custom_parameters', directory)

def get_merge_program(directory):
    merge_path = options.get_dependency_path('merge_path',directory)
    merge_command = options.get_dependency_path('merge_program',directory)
    return os.path.join(merge_path, merge_command)

# merge module using PEAR modeled on trim.py
# return a valid get response.
def merge(arg_string, directory):
    call_string = get_merge_program(directory) + " " + get_merge_invocation(directory)
    return run_server.run_process(call_string.split(' '), directory,True)

