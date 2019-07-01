FROM ubuntu:latest

RUN apt-get update -y && apt-get install -y python-pip python-dev build-essential python-virtualenv
COPY . .

RUN virtualenv /venv

# python 2.7 will end of life 1/1/2020
RUN /bin/bash -c "source /venv/bin/activate; pip install -r requirements.txt"

ENTRYPOINT /bin/bash -c "source /venv/bin/activate; python mSat_server.py"