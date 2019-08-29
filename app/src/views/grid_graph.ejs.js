<div id="buttons">
    <button id="addGroup" disabled onclick="addGridGraph()">Add group</button>
    <button id="removeGroup" disabled onclick="removeGridGraph()">Remove group</button>
    <div id="gridGraphSelector" style="white-space: nowrap; display: inline;">
    </div>
</div>
<div id="graph_wrapper" class="noselect">
    <div id="primers_grid_container"> 
    <div id="primers_grid"> 
    <span id="primers_grid_hdr">Locus&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Called</span>
    <span id="primers_grid_contents"><br/></span>
 </div>
 </div>
<div id="all_graphs">
// <!--todo - this should be in JS and the JS should be rendering out of server query that renders -->
// <!--from a template-->
// <!--it should do this on demand. Right now, this is wasteful and can crash with more than-->
// <!--50 total creates-->
// {% for i in range(0,49) %}
//
// <div id="graph_and_labels{{i}}" style="  vertical-align: top; padding-top: 6px; ">
// <div id="graph_container{{i}}">
// <div id="mainCanvasContainer{{i}}" style="display: inline-flex; ">
// <canvas id="mainCanvas{{i}}" class="canvas{{i}}" style="position:relative; "></canvas>
// <canvas id="mainCanvasBackground{{i}}" style="position:relative; "></canvas>
// </div>
// <canvas id="sample_names{{i}}" class="canvas{{i}}" style="position:relative;"></canvas>
//
// </div>
//
//
// <canvas id="length_labels{{i}}" class="canvas{{i}}"></canvas>
// <br>
// <canvas id="hit_bars{{i}}" class="canvas{{i}}"></canvas>
// </div>
// {% endfor %}
//
// </div>
// </div>
// <canvas id="tip" width=170 height=20></canvas>