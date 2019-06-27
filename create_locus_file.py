#!/usr/bin/env python
import sys
import os

infile = ""; outfile = ""; fwdPrimer = ""; revPrimer = "";
fhout = None;
isFastq = False; qualPct = 0; qualthreshold = 30; # if fastq and qual vals, check to exclude recs
sampLenCount_map = {}


def reset_variables():
    global infile, outfile, fwdPrimer, revPrimer, qualPct, qualthreshold, fhout,isFastq,sampLenCount_map

    infile = ""; outfile = ""; fwdPrimer = ""; revPrimer = "";
    fhout = None;
    isFastq = False; qualPct = 0; qualthreshold = 30; # if fastq and qual vals, check to exclude recs
    sampLenCount_map = {}


def complement(ch): # table lookup is faster but this is just for a short string
    if ch == 'A' or ch == 'a':
        return 'T'
    elif ch == 'C' or ch == 'c':
        return 'G'
    elif ch == 'G' or ch == 'g':
        return 'C'
    elif ch == 'T' or ch == 't':
        return 'A'
    else:
        return ch

def primers_match(seq): # just like grep exact match now but can expand to approximate match later
    if seq.startswith(fwdPrimer):
        if seq.endswith(revPrimer):
            return True
    return False

def qualityRec(quals):
    if qualPct > 0 and qualthreshold > 0:
        num_mtg_thresh = 0
        ln = len(quals); PhredOFS = 33 # presume all 1.8 CASAVA or greater
        for ch in quals:
            if (ord(ch)-PhredOFS) >= qualthreshold:  # todo: check if this should be ord not chr
                num_mtg_thresh += 1

        pct = (num_mtg_thresh + 1.0) / ln
        return pct >= qualPct

    return True

def get_sample_name(hdr):
    nm = ""
    if hdr[0] == ">" or hdr[0] == "@":
        nm = hdr[1:]
        sep = nm.find("@")
        if sep < 0:
            sep = nm.find("_")
        if sep < 0:
            sep = nm.find(" ")
        if sep > 0:
            nm = nm[:sep]
    return nm


def makeLocusFile():
    global sampLenCount_map, isFastq
    # print infile, outfile, fwdPrimer, revPrimer
    try:
        fh = open(infile)
    except (OSError, IOError) as e:
        errmsg = "err: " + infile + " " + repr(e)
        return errmsg, 404

    hdr = fh.readline().strip()
    if hdr and hdr[0]=="@":
        isFastq = True

    while hdr:
        seq = fh.readline().strip()
        if not seq:
            break
        seqOK = True
        if isFastq: # throwaway the 3rd and read the 4th line, qual, of the fastq record
            ln = fh.readline().strip()
            if not ln:
                break
            quals = fh.readline().strip
            if not quals:
                break
            if qualPct > 0 and not qualityRec(quals):
                seqOK = False

        if seqOK and primers_match(seq):
            allele = len(seq)
            samp_nm = get_sample_name(hdr)
            if samp_nm != "":
                if not samp_nm in sampLenCount_map:
                    sampLenCount_map[samp_nm] = {} # initialize value as an empty dict
                if not allele in (sampLenCount_map[samp_nm]):
                    sampLenCount_map[samp_nm][allele] =  0
                sampLenCount_map[samp_nm][allele] += 1

        hdr = fh.readline().strip()

    if fh: fh.close()
    return write_counter_maps()

def write_counter_maps():
    global fhout
    totalreads = 0
    numsamps = len(sampLenCount_map)
    if numsamps == 0:
        return totalreads, numsamps # 0, 0

    # write out each allele len info: <num_alleles>\t<sample_nm>\t<allele_len>
    for samp_alleles in sorted(sampLenCount_map):
        allele_lens = sampLenCount_map[samp_alleles]
        for a in sorted(allele_lens):
            numreads = allele_lens[a]
            totalreads += numreads
            sout = str(numreads) + "\t" + samp_alleles + "\t" + str(a)
            # print sout
            if fhout is None:
                fhout = open(outfile, "w+")
            fhout.write(sout + "\n")

    if fhout is not None:
        fhout.close()
        fhout = None
    return totalreads, numsamps # number of reads matching the primer pairs


def options():
    global infile, outfile, fwdPrimer, revPrimer, qualPct, qualthreshold, fhout
    infile = sys.argv[1]; outfile = sys.argv[2]; fwdPrimer = sys.argv[3]; revPrimer = sys.argv[4]

    fhout = None

# TODO: Allow users to specify qualPct and qualThreshhold
def create_locus_file(directory, input_file, locus_name, forward_primer, reverse_primer):
    global infile, outfile, fwdPrimer, revPrimer, qualPct, qualthreshold, fhout
    reset_variables()
    fhout = None
    qualPct = 0
    qualthreshold = 0
    #  TODO make the name configurable in options
    # change to AlleleLens.txt 05Jul2017
    outfile = os.path.join(directory,locus_name + "_AlleleLens.txt")
    infile = os.path.join(directory,input_file)
    fwdPrimer = forward_primer
    revPrimer = reverse_primer

    cstr = ""
    for ch in revPrimer:
        cstr += complement(ch)

    revPrimer = cstr.upper()[::-1]

    print ("Scanning " + locus_name)

    # TODO: Hardcoded, should be options
    out_file_name = os.path.join(directory,"primer_counts.tsv")
    numreads, numsamps = makeLocusFile()
    if not os.path.isfile(out_file_name):
        counts_file = open(out_file_name, "w+")
        counts_file.write("Locus Name\tMatching Reads\tSamples\n")
        counts_file.close()
    counts_file = open(out_file_name, "a")
    counts_file.write(locus_name + "\t" + str(numreads) + "\t" + str(numsamps) + "\n")
    counts_file.close()

    return numreads,numsamps
