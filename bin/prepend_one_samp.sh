#!/bin/bash
# 04Apr2016 JBH - this is called from the html page for each sample set
# Inputs:
#   $1 is directory where files located
#   $2 is sample_name
#   $3 is R1.fq filename
#   $4 is R2.fq filename
#   optional $5 is string "truncate" which replaces existing output files, if present.
#                         if not present, it makes new files for the first invocation of this
#                         script.
#
# $5 is set to "truncate" for the first call in a series of calls to the script to truncate
# the files FullSampleRun_R1.fq and FullSampleRun_R2.fq
#
# upon success, returns number of records appended to the FullSampleRun files
# all err msgs prefixed with "err:" so caller can discriminate between those and success

# This makes two files - an r1 (forward) and an r2 file (reverse) from all the samples.
# samples in this file is grouped.




function add_sample_to_headers { # $1 is sample_nm to prepend, $2 is name of fq file input
    # use zgrep so zipped and non-zipped files handled alike
    zgrep . $2 | awk -v nm="$1" '
        {ln++; if(ln==1) print "@" nm $0; else print $0; if(ln>=4) ln=0}
        # NR >=8 {exit 0} # debug to process 2 records only, comment or remove for full runs
    '
}

if [ "$#" -ge 4 ]; then
    dir="$1"
    if [ -d "$dir" ]; then
        R1_fq="${dir}/$3"
        R2_fq="${dir}/$4"
        if [ -f $R1_fq -a -f $R2_fq ]; then
            sample_nm=$2
            out_R1="${dir}/FullSampleRun_R1.fq"
            out_R2="${dir}/FullSampleRun_R2.fq"
            # echo "parms ok. sample_nm $sample_nm"; ls -l $out_R1 $out_R2; exit 0 # debug
            if [ "$5" = "truncate" ]; then
                # echo "truncating FullSampleRun files" # debug
                > $out_R1
                > $out_R2
            fi
            add_sample_to_headers $sample_nm $R1_fq >> $out_R1
            add_sample_to_headers $sample_nm $R2_fq >> $out_R2
            
            R1_recs=$(echo $(zgrep -c . $R1_fq)/4 | bc)
            R2_recs=$(echo $(zgrep -c . $R2_fq)/4 | bc)
            if [ $R1_recs -eq $R2_recs ]; then
                echo "${R1_recs}"
            else
                echo "err: ${R1_recs} records in $R1_fq and $R2_recs in $R2_fq (problem when not the same number of recs)"
            fi

        else
            echo "err: both files must exist: \"$R1_fq\" and \"$R2_fq\""
        fi
    else
        echo "err: not a valid directory: \"$dir\""
    fi
else
    echo "err: too few arguments. require at least: dir, sample_name, R1.fq_name, R2.fq_name"
fi
