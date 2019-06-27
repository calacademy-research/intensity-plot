#!/bin/bash
git fetch > build_log.txt 2>&1
if [ -s build_log.txt ]
then
   git pull
   ./restart_server.sh
else
    echo "no  changes"
fi
