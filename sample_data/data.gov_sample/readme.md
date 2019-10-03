# Alternate Use Cases - Exploration

This dir contains sample datasets from various sources, and scripts to process them into the intensity-plot data format.  The purpose is to explore alternate usecases for the intensity-plot tool.

## Datasets

**myl-tavg-stddev.txt**
- source: https://www.data.gov/climate/ecosystem-vulnerability/ - NOAA 1981-2010 Climate Normals
- contains: monthly standard deviation of temperature normals for NOA weather stations
- format: STN_ID,  Value+Flag (x12, one per month)
- See the readme.txt file for flag value meanings


## To load the data

Copy the data files mly-tavg.stddev.js and muinfo2.json to app/src/Components/App, and change these lines in index.js:

```html
// import * as data from "../../muinfo.json"
// import text from "../../TG_MS1_AllelCall"
import * as data from "../../muinfo2.json"
import text from "../../mly-tavg-stddev"
```
