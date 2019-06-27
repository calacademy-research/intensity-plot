#!/bin/bash
if [ -f "$1" ]; then
   cat "$1"
else
   echo "err: file not found"
fi
