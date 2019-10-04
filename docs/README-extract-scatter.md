# Project scope

  Extract the "intensity plot" from the existing framework, ideally (stretch goal) turning it into a reusable
  javascript component. 
  
  Evaulate, design, implement new features of the exisitng component so that it is 
  applicable to a wider array of data.
  
  Improve code as part of the extraction process.
  
  Document inputs, outputs, and usage.
  

# Install/setup with virtualenv python2 (tested on mac):
`which python2`

`virtualenv -p /usr/local/bin/python2 venv`

`source ./venv/bin/activate`

`pip install -r requirements.txt`

`python mSat_server.py`


# Install
pip install Flask
pip install --upgrade google-api-python-client

If on mac:
pip install flask-socketio  --ignore-installed six
if not on mac:
pip install flask-socketio
pip install flask-bootstrap
pip install gevent-websocket
pip install pyyaml
pip install eventlet

(if you get permission errors, use 'sudo pip install' for a system wide install)

Run server:
python mSat_server.py
or just
mSat_server.py





Point your browser to http://localhost:5001/

# Run
Ignore the pop-up warning about the project directory, if it appears. Click "OK".

In the topnav, click "1 Prepare uSat data".
Click the dot under "Step 1.1".
At the bottom of this page, there is a textbox for:
"Select Project directory.  This is where your FASTQ files are located. "
Enter your full (not relative) path to the sample_data directory, located under the top level bathwater dir.
Click the blue "Set" button, ignore the pop-up warning, and hit OK.


Click "2: Call alleles" in the topnav, and select "intensity plot".
On the left, under "Locus" , click TG_MS1.
Observe the inensity plot.

# What is the intensity  plot?

This plot is meant to help researchers distinguish "intersting" groups of data. In the image "working_with_groups.png",
you can see an example of using the tool to isolate distinct data groupings.

## Features

Clicking on any row creates a sub plot with only that row in it. Clicking on a row in a sub-plot removes that row 
from the sub-plot. 

For this application, one of the goals is to highlight no more than two data points of interest. This
is done with "automatic calls". "clear calls" removes these selections (they're initially selected). The user's
selections are saved to "muinfo.json".

Templates (aka: Call mask) are meant to lock in - or out - specific user calls. That is, you can add something to the "exclude" list
or the "include" list, texturally.

Note: When we save the call mask, (aka: 'save calls'), we are saving the set of positives
(aka: we called this) and negatives. Negatives are extracted from the AlleleLens.txt files
on the server side. So, if an allele exists in the data but is NOT called, then it is marked
as such in the mask file (currently "cur_locuscalls"). To qualify for the "not" list, the
allele length must be at least 20% of the length of the most frequently appearing allele in
the AlleleLength file. 




# Development and the project

The goal is to have the intensity plot be a standalone project. The back end is currently written with flask, which is
probably a good choice, but all the existing python code is probably best discarded for the purposes of this project.


The javascript for the intensity plot code is primarily in:
static/js/musat_grid_graph.js   
static/js/musat_grid_locus.js
static/js/musat_draw_grid.js
static/js/musat_allele_calls.js has some template logic.
templates/grid_graph.html

The rest of the code should be discarded; start this project basically from scratch. 


## Desired features
A smart naming system for sub-plots and/or a way for users to be able to customize sub-plot naming.
A way to save sub-plot content
A well designed input format
A well deisnged set of outputs (user selections, subsets, etc)
How best to use color? We're currently highlighting with color (red) and size for smaller selections. Handy
  For this particular application, but maybe doesn't generalize well.
Drag a rectangle to select multiple rows.

  


Be able to select (or deselect) n points per row, user configurable?







