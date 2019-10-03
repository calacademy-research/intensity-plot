# Process the mly-tavg-stddev.txt file into something that intensity plot can understand

import os
import sys
import json


def main():
    ignore_flags = "PQ"  # provisional and quasi-normal, ignore
    good_flags = "CSR"  # complte, standard, representative - keep
    fname = 'mly-tavg-stddev.txt'
    print('processing : {}'.format(fname))
    filename = os.path.join(sys.path[0], fname)
    with open(filename) as f:
        raw_data = f.read()

    processed_data = []
    muinfo_json = {}

    lines = raw_data.splitlines()
    for l in lines[:25]:
        data = l.split()
        stn = data[0]
        keep = True
        l1 = l2 = [0, 0]

        # get the top 2 items:
        for idx, d in enumerate(data[1:]):
            # last char is always a flag
            num = int(d[:-1])
            flag = d[-1:]
            # uncomment to filter data by confidence
            # keep = flag in good_flags
            entry = [idx+1, stn, num]
            if num >= l1[1]:
                l2 = l1
                l1 = [idx, num]
            else:
                l2 = [idx, num] if num >= l2[1] else l2

            if keep:
                processed_data.append(entry)

        muinfo_json[stn] = [l1, l2]

    # print(processed_data)
    print(muinfo_json)

    # AllelCalls file
    filename = os.path.join(sys.path[0], 'mly-tavg-stddev.js')
    with open(filename, 'w') as f:
        f.write('const SampleText = `\n')
        for line in processed_data:
            f.write('{}\t>{}\t{}\n'.format(line[0], line[1], line[2]))
        f.write('` \nexport default SampleText')
    # muinfo_json file
    filename = os.path.join(sys.path[0], 'muinfo2.json')
    with open(filename, 'w') as f:
        f.write('{"oLocusCalls":{"TG_MS1":')
        f.write(json.dumps(muinfo_json))
        f.write('},"aLocusFile":[],"aFullRunFiles":[],"aMotifs":[]}')

    print('done.')


if __name__ == "__main__":
    main()
