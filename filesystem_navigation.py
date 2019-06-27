import os
import options
import cgi
import re



# root is the directory we're currently listing (or initially exploring)
# parent is the parent of a leaf node.
def jstree_list_directory(parent, root):
    # global basepath
    data = []
    parentString = parent

    if root and len(root.encode('utf-8')) > 0 and os.path.isdir(root):
        basepath = root
    # else:
    #     basepath = options.get_option_by_caterogy('program', 'project_directory')
    else:
        raise IOError
    if(None==parent):
        parentString = "#"

        # Calculate one dir up
        delimeter="\\"
        if basepath.find("/") > -1:
            delimeter = '/'
        truncated_basepath = basepath.rstrip(delimeter).lstrip(delimeter)
        dir_array=truncated_basepath.split(delimeter)
        del dir_array[len(dir_array) -1:]
        one_up=os.path.abspath(os.sep)
        for dir_element in dir_array:
            one_up = os.path.join(one_up,dir_element)

        data.append(make_jstree_node(one_up, parentString, "..", True))
    else:
        basepath = parent
    # TODO: Handle "permission denied" elegantly. Currently blows stack on the line below.
    # curl http://localhost:5001/jstree_directory?new_root=/.fseventsd to repro
    for fname in os.listdir(basepath):
        path = os.path.join(basepath, fname)
        html_path = cgi.escape(path)
        if os.path.isdir(path):
            data.append(make_jstree_node(html_path, parentString, fname, True))
        else:
            data.append(make_jstree_node(html_path, parentString, fname, False))
    return data


def fastq_list_directory(directory):
    return fastq_list_directory_version_0_(directory)

    # return fastq_list_directory_version_1_(directory)

# this version does great things in files that are in the expected format.
# this won't always be the case, so we need to figure out a way to try
# them both and see if one version picks up more files and use that one
# or todo: some such way to get benefit of this version with the other version as fallback

def fastq_list_directory_version_1_(directory):
    data = {}

    for fname in os.listdir(directory):
        node = make_fastq_node(fname,directory)
        if node is None:
            continue

        key = node['name']
        if key in data:
            existing = data[key]
            filename_keys = ['R1_filename','R2_filename','R_filename']
            for filename_key in filename_keys:
                if node[filename_key] is not None:
                    existing[filename_key] = node[filename_key]

        else:
            data[key] = node
    return data


# more simple minded version but does not rely on any structure save _R1_ and _R2_ in files that end in a q or a z
# key is ordinal position of the entry and name is Sample_<num>
def fastq_list_directory_version_0_(directory):
    data = {}; r1s = {}; r2s = {}
    for fname in os.listdir(directory):
        if fname[-1] == 'z' or fname[-1] == 'q':
            if "_R1_" in fname:
                r1s[fname] = ""
            elif "_R2_" in fname:
                r2s[fname] = ""


    for r1 in r1s:
        r2 = r1.replace("_R1_","_R2_",1)
        if r2 in r2s:
            r1s[r1] = r2

    nsets = 0
    for r1 in sorted(r1s):
        if r1s[r1] != "":
            nsets += 1
            name = "Sample_" + str(nsets)
            r2 = r1s[r1]
            data[nsets] = {'name': name, 'R1_filename': r1, 'R2_filename': r2}

    return data

# TODO: hardcoded filenames.
def remove_full_sample(directory):
    os.remove(os.path.join(directory, 'FullSampleRun_R1.fq'))
    os.remove(os.path.join(directory, 'FullSampleRun_R2.fq'))


def remove_trim_files(directory):
    os.remove(os.path.join(directory, 'FullSampleRun_trim_R1.fq'))
    os.remove(os.path.join(directory, 'FullSampleRun_trim_R2.fq'))

def remove_merge_files(directory):
    os.remove(os.path.join(directory, 'MergeFullRun.assembled.fastq'))
    os.remove(os.path.join(directory, 'MergeFullRun.discarded.fastq'))
    os.remove(os.path.join(directory, 'MergeFullRun.unassembled.forward.fastq'))
    os.remove(os.path.join(directory, 'MergeFullRun.unassembled.reverse.fastq'))


# TODO: test this
def remove_allele_files(directory):
    files = list_directory(directory)
    for this_file in files:
        if this_file.endswith("AlleleLens.txt"):
            os.remove(os.path.join(directory,this_file))



def list_directory(directory):
    valid_files = []
    for file_name in os.listdir(directory):
        file_path = os.path.join(directory, file_name)
        if os.path.isfile(file_path):
            file_size = os.path.getsize(file_path)
            file_date = os.path.getmtime(file_path)
            file_object = [file_name,file_size,file_date]
            valid_files.append(file_object)
    return valid_files

# TODO: We may get nonconforming file names; support them.
def make_fastq_node(fname, directory):
    node={}
    regex=re.compile("^([a-zA-Z0-9-]*)_([a-zA-Z0-9-]*)_L([0-9-]*)_R([0-9-]*)?_([0-9-]*)((.fastq)?(.fq)?)((.zip)?(.gzip)?(.gz)?)")
    matches = regex.findall(fname);
    if len(matches) == 0:
        return None
    node['name'] = matches[0][0]
    node['sequence'] = matches[0][1]
    node['lane'] = int(matches[0][2])

    node['R1_filename'] = None
    node['R2_filename'] = None
    node['R_filename'] = None


    if matches[0][3] == '1':
        node['R1_filename'] = fname
    elif matches[0][3] == '2':
        node['R2_filename'] = fname
    else:
        node['R_filename'] = fname

    node['set'] = matches[0][2]
    return node

    # Full match	0-38	`HiBiK15-02_S202_L001_R2_001.fastq.gzip`
    # Group 1.	0-10	`HiBiK15-02`
    # Group 2.	11-15	`S202`
    # Group 3.	17-20	`001`
    # Group 4.	22-23	`2` # will be "none" if it's just "R".
    # Group 5.	24-27	`001`
    # Group 6.	27-33	`.fastq`


def make_jstree_node(id, parent, text, is_directory = False):
    node={}
    node['id'] =id
    # node['parent'] = parent
    node['text'] = text
    if(not is_directory):
        node['icon'] = 'jstree-file'
    else:

        node['state'] = 'closed'
        # node['status'] = 'closed'
        # node['opened'] = 'false'
        # node['disabled'] = 'false'


        node['children'] = True
    return node

