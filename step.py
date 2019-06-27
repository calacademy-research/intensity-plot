import yaml
import glob
import os
import logging

# Returns the id of the step we're ready to run. i.e. : Everthing is done
# in step 5, so it returns six.
# Not intuitive, but it makes the logic elsewhere cleaner. Could revise.

logging.basicConfig(format='%(levelname)s:%(message)s', level=logging.DEBUG)
# logging.basicConfig(level=logging.DEBUG)

def get_files(data_directory, filename):
    path = os.path.join(data_directory , filename);
    return glob.glob(path)

# file must be present and have a non zero length
def check_file_present(data_directory, filename):
    logging.debug("\t\tchecking that file " + filename + " exists")
    files = get_files(data_directory, filename)
    if len(files) > 0:
        for file in files:
            logging.debug ("\t\tverifying file size of " +file)
            if os.path.getsize(file) == 0:
                return False
        return True
    return False

def check_file_contains(data_directory, filename, str):
    logging.debug("\t\t\tchecking that file " + filename + " contains " + str)
    files = get_files(data_directory, filename)
    for wildcard_file in files:
        found = False
        data_file = file(wildcard_file)
        for line in data_file:
            if str in line:
                found = True
                break
        if not found:
            logging.debug("Unable to find " + str + "in" + wildcard_file)
            return False
    return True

def check_file_lacks(data_directory, filename, str):
    logging.debug("\t\t\tchecking that file " + filename + " lacks " + str)
    files = get_files(data_directory, filename)
    for wildcard_file in files:
        found = False
        data_file = file(wildcard_file)
        for line in data_file:
            if str in line:
                found = True
                break
        if found:
            logging.debug("Found " + str + " in " +wildcard_file)
            return False
    return True

def check_file_constraints(data_directory, filename, constraints):
    if not check_file_present(data_directory, filename):
        return False
    if constraints is not None:
        logging.debug ("\t\tChecking constraints")
        for constraint_dict in constraints:
            for constraint in constraint_dict:
                for constraint_element in constraint_dict[constraint]:
                    if constraint=="contains":
                        if not check_file_contains(data_directory, filename, constraint_element):
                            return False
                    elif constraint=="lacks":
                        if not check_file_lacks(data_directory, filename, constraint_element):
                            return False
                    else:
                        logging.debug("Unknown constraint:", constraint)
                        return False

    return True

def build_steps_dict():
    stream = open("step_definitions.yml", "r")
    step_dict = {}
    steps = yaml.load_all(stream)
    # returns a generator; we need a dict so we can handle out of order
    # steps defined in the .yml file.
    for step in steps:
        for k,v in step.items():
            step_dict[k] = v
    return step_dict

def get_current_step(data_directory):

    step_dict = build_steps_dict()
    i = 0
    for i in range(1, len(step_dict)+1):
        logging.debug("Step: " + str(i))
        if step_dict[i] is None:
            continue
        for element in step_dict[i]:
            if not isinstance(element, dict):
                logging.debug("\tfile: " + element)
                if not check_file_constraints(data_directory, element, None):
                    return i-1
            else:
                for dict_element in element:
                    logging.debug("\tfile:" + dict_element)
                    if not check_file_constraints(data_directory, dict_element, element[dict_element]):
                        return i-1

    return i

def remove_files_for_step(data_directory,step_number):
    step_dict = build_steps_dict()
    for filename in step_dict[int(step_number)]:
        files = get_files(data_directory, filename)
        if len(files) > 0:
            for file in files:
                logging.debug ("\t\tremoving file:" + file)
                os.remove(file)



