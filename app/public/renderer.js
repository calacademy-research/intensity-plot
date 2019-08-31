// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//import sumAll from '../src/js/musat_grid_graph.js';

const mu =  require("../src/js/musat_grid_graph");

console.log(mu)
var grid = new mu.grid(); 

console.log(grid);

let $ = require('jquery')  // jQuery now loaded and assigned to $
let count = 0
$('#click-counter').text(count.toString())
$('#countbtn').on('click', () => {
   count ++ 
   $('#click-counter').text(count)
}) 

// function gridInnars() {

//     // <!--it should do this on demand. Right now, this is wasteful and can crash with more than-->
//     // <!--50 total creates-->
//     // <% for(var i=0; i<50; i++) {%>
//     //add to element with id = all_graphs
// for (let index = 0; index < 50; index++) {
//         var html = 
//         <div id="graph_and_labels<%=i%> " style="vertical-align: top; padding-top: 6px;">
//           <div id="graph_container<%=i%>">
//                 <div id="mainCanvasContainer<%=i%>" style="display: inline-flex; ">
//                     <canvas id="mainCanvas<%=i%>" class="canvas<%=i%>" style="position:relative; ">
//                     </canvas>
//                     <canvas id="mainCanvasBackground<%=i%>" style="position:relative;">
//                     </canvas>
//                 </div>
//               <canvas id="sample_names<%=i%>" class="canvas<%=i%>" style="position:relative;">
//               </canvas>
//             </div>
//             <canvas id="length_labels<%=i%>" class="canvas<%=i%>">
//             </canvas>
//             <br>
// <canvas id="hit_bars<%=i%>" class="canvas<%=i%>">
// </canvas>
// </div>
//  <% } %>
// }