import json
import os

OPTIONS_FILE_NAME="options.json"



# Currently realoads every invocation. Wants a singleton or something.

def get_options_dict(directory):  # return program_info object from options.json
    options_file = os.path.join(directory, OPTIONS_FILE_NAME)
    try:
        f = open(options_file)
    except IOError:
        return None  # allow file to not exist

    try:
        with open(options_file) as json_file:
            json_data = json.load(json_file)
    except ValueError as e:
        raise SyntaxError("Unable to parse options file \""+
                          str(OPTIONS_FILE_NAME)+
                          "\" in directory\""+
                          directory +
                          "\"\n"+
                          "Parse error: {0}".format(e))

    return json_data

def get_dependency_path(item_name, directory):
    return get_option_by_caterogy('dependency_paths',item_name, directory)

def get_program_argument(item_name, directory):
    return get_option_by_caterogy('program_arguments',item_name, directory)

def get_option_by_caterogy(category,item_name, directory):
    options_dict = get_options_dict(directory)
    try:
        ret_val = options_dict[category][item_name]
    except KeyError:
        raise KeyError('Cannot locate path for ' + item_name)
    return ret_val.encode('ascii','ignore')

# Not tested; save not implemented. Save happens at server level where we
# replace the whole json file en masse
def set_option_by_category(category,item_name,option_value, directory):
    options_dict = get_options_dict(directory)
    try:
        options_dict[category][item_name] = option_value
    except KeyError:
        raise KeyError('Cannot locate path for ' + item_name)


def normalize_path(path):
    return os.path.abspath(path) + "/"

def bin_root(new_bin_root=None):
    try:
        bin_root.root
    except:
        bin_root.root = normalize_path("./bin")
    if new_bin_root is not None:
        bin_root.root = normalize_path(new_bin_root)
    return bin_root.root

def server_root(new_server_root=None):
    try:
        server_root.root
    except:
        server_root.root = normalize_path("./")
    if new_server_root is not None:
        server_root.root = normalize_path(new_server_root)
    return server_root.root