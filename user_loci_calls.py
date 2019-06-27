import json
import os
import copy
import operator
from flask import abort
from ast import literal_eval


# TODOS for usability:
# Check if the file exists already. Creaet high level "check_exists" in py_server. Return boolean.
# Grey out the "load" button if the file does NOT exist
# Warn about overrwrite if it does exist (if you're trying to save)

# Must return data in the form:
#     Example: oLocusCalls
#   'TG_MS1':
#
#     'HiBiK15-01':Array[0] // no called alleles for HiBiK15-01
#     'HiBiK15-02':Array[2] // alleles at 145 and 159
#      0:Array[2]
#          0:145
#          1:359
#      1:Array[2]
#          0:159
#          1:511

def lockouts_processing(return_map, cur_locus, line):
    if line.startswith('['):
        locked_out_length = int(line.translate(None, '[]'))
        return_map[cur_locus].append(locked_out_length)


def includes_processing(return_map, cur_locus, line):
    if line.startswith('('):
        return_map[cur_locus].append(literal_eval(line))


# reads
def load_user_data(filename, processing_function):
    return_map = {}
    try:
        with open(filename, 'r') as infile:
            cur_locus = None
            for line in infile:
                if not line.strip():
                    continue
                indent_level = len(line) - len(line.lstrip())
                line = line.strip()
                if indent_level == 0:
                    cur_locus = line
                    return_map[cur_locus] = []
                if indent_level == 1:
                    processing_function(return_map, cur_locus, line)


    except IOError as e:
        errmsg = "err: {1} ({0})".format(e.errno, e.strerror)
        print errmsg
        return errmsg

    return return_map


def load_user_defined_allele_lockouts(filename):
    return load_user_data(filename, lockouts_processing)


def load_user_defined_allele_lengths(filename):
    return load_user_data(filename, includes_processing)

def build_max_frequency_map_sample(sample):
    max_value = 0
    for tuple in sample:
        if tuple[1] > max_value:
            max_value = tuple[1]
    return max_value

def build_sum_frequency_sample(sample):
    sum_value = 0
    for tuple in sample:
        sum_value += tuple[1]

    return sum_value

def build_max_frequency_map(allele_data, cur_locus):
    max_frequency_map_per_sample = {}
    for cur_sample in allele_data[cur_locus]:
        max_frequency_map_per_sample[cur_sample] = \
            build_max_frequency_map_sample(allele_data[cur_locus][cur_sample])
    return max_frequency_map_per_sample


# De-noising:
# Sum the total of all the bar lengths (for a single locus and specimen).
# for any given bar, its length is expressed as a percentage of this total sum.
# That its its relative abundance. Anything under X percentage (probably 10, we will
# need to tune) will be disregarded for the peak choosing algorithm.

# returns a copy of the allele data that has low signal values removed.
def de_noise(allele_data, threshhold_percent_int):
    de_noised_data = copy.deepcopy(allele_data)
    for cur_locus in allele_data:
        for cur_sample in allele_data[cur_locus]:
            sample_sum_value = build_sum_frequency_sample(allele_data[cur_locus][cur_sample])

            for cur_tuple in allele_data[cur_locus][cur_sample]:
                # print ( "Checking out: " + str(cur_tuple[1]) + " vs max: " + str(max_frequency_map_per_sample[cur_sample]))
                if cur_tuple[1] < (threshhold_percent_int / float(100)) * sample_sum_value:
                    # print ("locus: " + cur_locus + " sample: "+ cur_sample + " length:"+ str(cur_tuple[0]) +" deleting noise: " + str(cur_tuple[1]))
                    de_noised_data[cur_locus][cur_sample].remove(cur_tuple)

    return de_noised_data


def build_percentage_calls_sample(sample):
    max_frequency_map_per_sample = build_max_frequency_map_sample(sample)

    for cur_tuple in sample:
        # print ("Source: " + str(cur_tuple[1]))
        cur_tuple[1] = (cur_tuple[1] / float(max_frequency_map_per_sample))*100
        # print ("converted to: " + str(cur_tuple[1]))


# Changes the "number of calls" to a percentage of the highest call in the sample.
# That is, "TG_MS1":"HiBiK10-01":[x][1] goes from an absolute to a percent.
def build_percentage_calls(data):
    for cur_locus in data:
        for cur_sample in data[cur_locus]:
            build_percentage_calls_sample(data[cur_locus][cur_sample])



# Maps a single sample
# Loci in the form:
#     0:Array[2]
#          0:145
#          1:359
#      1:Array[2]
#          0:159
#          1:511
# converted to map:
# of 145 to 359
def create_sample_map(source_data):
    create_sample_map={}
    for item in source_data:
        create_sample_map[item[0]] = item[1]
    return create_sample_map


# does a fuzzy match between the real (saved) data and the saved allele lengths.
def build_oLocusCalls(allele_data, current_user_calls, saved_allele_lengths):
    original_data = allele_data
    return_data = {}
    allele_data = de_noise(allele_data,10)  # May want to remove this.
    build_percentage_calls(allele_data)
    for cur_locus in allele_data:
        cur_saved_alleles = saved_allele_lengths[cur_locus]
        # iterate over samples for this locus.
        # Find, save, and score the posisble matches for this locus by looking
        # at each of the cur_saved_alleles.
        # Sort by score, and assign the winner.

        for cur_sample in allele_data[cur_locus]:
            # For the current sample, create a mapping from bucket to count
            sample_map = create_sample_map(allele_data[cur_locus][cur_sample])
            candidate_tuples = {}
            for cur_tuple in cur_saved_alleles:
                score0 = 0
                score1 = 0
                if cur_tuple[0] in sample_map:
                    score0 = sample_map[cur_tuple[0]]
                if len(cur_tuple) > 1:
                    if cur_tuple[1] in sample_map:
                        score1 = sample_map[cur_tuple[1]]
                if score0+score1 >0:
                    candidate_tuples[cur_saved_alleles.index(cur_tuple)]= score0+score1

            sorted_candidates = sorted(candidate_tuples.items(), key=operator.itemgetter(1), reverse=True)
            # for candidate in sorted_candidates:
            #     print("locus: " + cur_locus + " sample:" + cur_sample + " tuple: " + str(candidate) + " index:" +
            #           str(sorted_candidates.index(candidate)))
            if len(sorted_candidates) > 0:
                winner_candidate = 0
                while True:
                    # print("Winner candidate:" + str(winner_candidate) + " len:" + str(len(sorted_candidates)))

                    if winner_candidate >= len(sorted_candidates):
                        break
                    winner_index = sorted_candidates[winner_candidate][0]
                    # winner_score = sorted_candidates[winner_candidate][1]
                    winner_tuple = cur_saved_alleles[winner_index]
                    results_sample = create_sample_map(allele_data[cur_locus][cur_sample])
                    if len(winner_tuple) == 1 and (winner_tuple[0] in results_sample):
                        break
                    elif (winner_tuple[0] in results_sample) and (winner_tuple[1] in results_sample):
                        break

                    winner_candidate += 1
                if winner_candidate >= len(sorted_candidates):
                    continue #there's gotta be a better way
                results_sample = create_sample_map(original_data[cur_locus][cur_sample])

                winner_value = results_sample[winner_tuple[0]]
                # print("locus:" + cur_locus + " sample:" + cur_sample + " called alleles:" + str(winner_tuple)) + " score:" + str(winner_score)
                alleles = []
                alleles.append([winner_tuple[0],winner_value])
                if len(winner_tuple) > 1:
                    alleles.append([winner_tuple[1],results_sample[winner_tuple[1]]])

                if cur_locus not in return_data:
                    return_data[cur_locus]={}
                return_data[cur_locus][cur_sample] = alleles
    return return_data


def remove_locked_out_alleles(working_directory, filename, current_user_calls):
    locked_out_alleles = load_user_defined_allele_lockouts(filename)
    for cur_locus in current_user_calls:
        remove_me_array = locked_out_alleles[cur_locus]
        for cur_sample in current_user_calls[cur_locus]:
            for cur_length in current_user_calls[cur_locus][cur_sample]:
                for cur_tuple in list(current_user_calls[cur_locus][cur_sample]):
                    # print ("Checking out: " + str(cur_tuple[0]))
                    if cur_tuple[0] in remove_me_array:
                        # print ("deleting blocked allele " + str(cur_tuple[0]))
                        current_user_calls[cur_locus][cur_sample].remove(cur_tuple)
    return current_user_calls


def automatic_calls(working_directory):
    allele_data = loadAlleleData(working_directory)
    allele_data = de_noise(allele_data,10)
    return_data = {}
    for cur_locus in allele_data:
        for cur_sample in allele_data[cur_locus]:
            sample_map = create_sample_map(allele_data[cur_locus][cur_sample])
            sorted_candidates = sorted(sample_map.items(), key=operator.itemgetter(1), reverse=True)
            if cur_locus not in return_data:
                return_data[cur_locus] = {}
            # Get top two hits

            if len(sorted_candidates) > 0:
                if sorted_candidates[0][1] > 20:         # abs cutoff for min first peak
                    return_data[cur_locus][cur_sample] = [list(sorted_candidates[0])]
                    if len(sorted_candidates) > 1:
                        if sorted_candidates[1][1] > 10:     # abs cutoff for min second peak
                            if(cur_sample not in return_data[cur_locus]):
                                return_data[cur_locus][cur_sample] = []
                            return_data[cur_locus][cur_sample].append(list(sorted_candidates[1]))


    return json.dumps(return_data)


def load_calls(working_directory, filename, current_user_calls):
    # User defined allele lengths; no sample names available, just loci.
    saved_allele_lengths = load_user_defined_allele_lengths(filename)

    #  Load the allele data (the actual raw allele data from the run)
    allele_data = loadAlleleData(working_directory)

    oLocusCalls = build_oLocusCalls(allele_data,
                                    current_user_calls,
                                    saved_allele_lengths)

    return json.dumps(oLocusCalls)


def loadAlleleData(working_directory):
    allele_data = {}
    for file in os.listdir(working_directory):
        if file.endswith("AlleleLens.txt"):
            file_path = os.path.join(working_directory, file)
            locus_name = file[:-len("_AlleleLens.txt")]
            print ("processing " + locus_name + " from file " + file_path)
            allele_data[locus_name] = {}
            # format example:
            # 43      HiBiK15-02      328
            # (count) (sample name) (length)
            with open(file_path, 'r') as infile:
                for line in infile:
                    split_array = line.split()
                    uSat_frequency = int(split_array[0])
                    uSat_sample = split_array[1]
                    uSat_length = int(split_array[2])
                    if (uSat_sample not in allele_data[locus_name]):
                        allele_data[locus_name][uSat_sample] = []
                    allele_data[locus_name][uSat_sample].append([uSat_length, uSat_frequency])
    return allele_data


# Note: When we save the call mask, (aka: 'save calls'), we are saving the set of positives
# (aka: we called this) and negatives. Negatives are extracted from the AlleleLens.txt files
# on the server side. So, if an allele exists in the data but is NOT called, then it is marked
# as such in the mask file (currently "cur_locuscalls"). To qualify for the "not" list, the
# allele length must be at least 20% of the length of the most frequently appearing allele in
# the AlleleLength file. Todo: make this an option that can be user adjusted?

def save_calls(allele_calls_json, working_directory, filename):
    allele_calls = None

    try:
        allele_calls = json.loads(allele_calls_json)
    except Exception as e:
        errmsg = "JSON parse error from server: {1}".format(e)
        print errmsg
        return errmsg

    allele_data = loadAllelesFromDirectory(working_directory)

    # Trim spurrious peaks - anything under 20% of the max peak is to be dropped.
    # we need to know the frequency of the max peak, so first pass generates that
    # then we have the cutoff number; anything that is less than 20% of the
    # max peak is dropped from the data structure.
    for cur_locus in allele_data:
        max_frequency = 0
        for peak_tuple in allele_data[cur_locus]:
            if peak_tuple[0] > max_frequency:
                max_frequency = peak_tuple[0]
        new_tuples = []
        for peak_tuple in allele_data[cur_locus]:
            if peak_tuple[0] < (max_frequency * 0.2):
                new_tuples.append(peak_tuple)
        allele_data[cur_locus] = new_tuples

    # Format is an array


    try:
        with open(filename, 'w') as outfile:
            for locus in sorted(allele_data):
                outfile.write(locus + "\n")
                called_loci = set()
                if locus in allele_calls:
                    for sample_name in allele_calls[locus]:
                        allele_list = []
                        # outfile.write ("\t" + sample_name + "\n")
                        if allele_calls[locus][sample_name] is not None:
                            for allele in allele_calls[locus][sample_name]:
                                call = allele[:-1][0]
                                allele_list.append(call)
                        allele_list.sort()
                        allele_tuple = tuple(allele_list)
                        called_loci.add(allele_tuple)

                all_loci = []
                for peak_set in sorted(called_loci):
                    if len(peak_set) > 0:
                        outfile.write("\t" + str(peak_set) + "\n")
                        for peak_item in peak_set:
                            all_loci.append(peak_item)

                uncalled_loci = set()
                for peak_tuple in allele_data[locus]:
                    if peak_tuple[1] not in all_loci:
                        if peak_tuple[1] not in uncalled_loci:
                            uncalled_loci.add(peak_tuple[1])

                for peak in sorted(uncalled_loci):
                    outfile.write("\t[" + str(peak) + "]\n")


                    # iterate over allele_data for this locus
                    # if the frequency is not in called_loci
                    # print it as [], aka: a negative choice.

    except IOError as e:
        errmsg = "err: {1} ({0})".format(e.errno, e.strerror)
        print errmsg
        return errmsg
    return json.dumps(True)


# allele_data:
# [locus name] = [ [frequency, length] , [frequency, length] .... ]
def loadAllelesFromDirectory(working_directory):
    allele_data = {}
    #  Load the allele data
    for file in os.listdir(working_directory):
        if file.endswith("AlleleLens.txt"):
            file_path = os.path.join(working_directory, file)
            locus_name = file[:-len("_AlleleLens.txt")]
            print ("processing " + locus_name + " from file " + file_path)
            allele_data[locus_name] = []
            # format example:
            # 43      HiBiK15-02      328
            # (count) (sample name) (length)
            with open(file_path, 'r') as infile:
                for line in infile:
                    split_array = line.split()
                    uSat_frequency = int(split_array[0])
                    uSat_length = int(split_array[2])
                    allele_data[locus_name].append([uSat_frequency, uSat_length])
    return allele_data

#
# // Adapted from https://github.com/simogeo/geostats/blob/master/lib/geostats.js
# // // Used to divide a set of numbers into clusters
# // // returns array of arrays containing clusters of numbers
# // /**
# //  * Credits : Doug Curl (javascript) and Daniel J Lewis (python implementation)
# //  * http://www.arcgis.com/home/item.html?id=0b633ff2f40d412995b8be377211c47b
# //  * http://danieljlewis.org/2010/06/07/jenks-natural-breaks-algorithm-in-python/
# //  */
# // function jenks_natural_breaks(num_array, numClusters) {
#                                                          //     var dataList = num_array.sort();
# //     var nbClass = numClusters || 2 // default to 2 clusters
#                                                       //
#                                                       //     // now iterate through the datalist:
# //     // determine mat1 and mat2
#                              //     // really not sure how these 2 different arrays are set - the code for
# //     // each seems the same!
# //     // but the effect are 2 different arrays: mat1 and mat2
#                                                           //     var mat1 = []
#                                                                             //     for (var x = 0, xl = dataList.length + 1; x < xl; x++) {
# //         var temp = []
# //         for (var j = 0, jl = nbClass + 1; j < jl; j++) {
# //             temp.push(0)
# //         }
# //         mat1.push(temp)
# //     }
# //
# //     var mat2 = [];
# //     for (var i = 0, il = dataList.length + 1; i < il; i++) {
# //         var temp2 = [];
# //         for (var c = 0, cl = nbClass + 1; c < cl; c++) {
# //             temp2.push(0)
# //         }
# //         mat2.push(temp2)
# //     }
# //
# //     // absolutely no idea what this does - best I can tell, it sets the 1st
# //     // group in the
# //     // mat1 and mat2 arrays to 1 and 0 respectively
# //     for (var y = 1, yl = nbClass + 1; y < yl; y++) {
# //         mat1[0][y] = 1;
# //         mat2[0][y] = 0;
# //         for (var t = 1, tl = dataList.length + 1; t < tl; t++) {
# //             mat2[t][y] = Infinity
# //         }
# //         var v = 0.0
# //     }
# //
# //     // and this part - I'm a little clueless on - but it works
# //     // pretty sure it iterates across the entire dataset and compares each
# //     // value to
# //     // one another to and adjust the indices until you meet the rules:
#     //     // minimum deviation
#                       //     // within a class and maximum separation between classes
# //     for (var l = 2, ll = dataList.length + 1; l < ll; l++) {
# //         var s1 = 0.0;
# //         var s2 = 0.0;
# //         var w = 0.0;
# //         for (var m = 1, ml = l + 1; m < ml; m++) {
# //             var i3 = l - m + 1;
# //             var val = parseFloat(dataList[i3 - 1])
# //             s2 += val * val
# //             s1 += val
# //             w += 1
# //             v = s2 - (s1 * s1) / w
# //             var i4 = i3 - 1
# //             if (i4 != 0) {
# //                 for (var p = 2, pl = nbClass + 1; p < pl; p++) {
# //                     if (mat2[l][p] >= (v + mat2[i4][p - 1])) {
# //                         mat1[l][p] = i3
# //                         mat2[l][p] = v + mat2[i4][p - 1]
# //                     }
# //                 }
# //             }
# //         }
# //         mat1[l][1] = 1
# //         mat2[l][1] = v
# //     }
# //
# //     var k = dataList.length
# //     var kclass = []
# //
# //     // fill the kclass (classification) array with zeros:
#     //     for (i = 0; i <= nbClass; i++) {
# //         kclass.push(0);
# //     }
# //
# //     // this is the last number in the array:
# //     kclass[nbClass] = parseFloat(dataList[dataList.length - 1])
# //     // this is the first number - can set to zero, but want to set to lowest
# //     // to use for legend:
#     //     kclass[0] = parseFloat(dataList[0])
# //     var countNum = nbClass
# //     while (countNum >= 2) {
# //         var id = parseInt((mat1[k][countNum]) - 2)
# //         kclass[countNum - 1] = dataList[id]
# //         k = parseInt((mat1[k][countNum] - 1))
# //         // count down:
#     //         countNum -= 1
#                            //     }
# //     // check to see if the 0 and 1 in the array are the same - if so, set 0
# //     // to 0:
# //     if (kclass[0] == kclass[1]) {
# //         kclass[0] = 0
# //     }
# //     return kclass
# // }