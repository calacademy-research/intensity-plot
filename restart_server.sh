#!/bin/bash
if [ -f "server.pid" ]
then
    echo running  kill -9 `cat server.pid`
    kill -9 `cat server.pid`
fi
exec ./mSat_server.py >& server.log &
echo $! > server.pid
echo launched process pid: `cat server.pid`
