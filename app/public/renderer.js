// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//import sumAll from '../src/js/musat_grid_graph.js';

var ary = text.split("\n");
var muFullData = JSON.parse(data);
mu = {};
mu.oLocusCalls = muFullData["oLocusCalls"];
hits = {};
orig_hits = {};
pop_info = {};
names = [];
pts_merged = {};
num_pops = 0;
initPrimerMinMax(); // 10May2016
sample_pts_trimmed = {}; // 10May2016 each sample has .left and .right arrays to show any pt trimmed when having too few reads to 
processData(ary);
new GridLocus("TG_MS1", hits, primer_min, primer_max, names, "TG_MS1");

let count = 0
$('#click-counter').text(count.toString())
$('#countbtn').on('click', () => {
   count ++ 
   $('#click-counter').text(count)
})