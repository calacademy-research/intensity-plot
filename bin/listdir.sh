#!/bin/bash
# currently, no matching files causes internal error to be reported from mSat_server.py
# so redirect error output to /dev/null and reset exit code to 0
ls $@ 2>/dev/null
exit 0
# >&2 echo $@ # debug to write to stderr
