import React, {Component} from 'react';
import './index.css'
import * as d3 from "d3";
import { mu as global } from "../../../../modules/global"
import {legendColor ,legendSize} from 'd3-svg-legend'



class Legend extends Component {
  constructor(props) {
    super(props)
    this.state = {
        hasData: false,
        colorRange: ["rgb(46, 73, 123)", "rgb(71, 187, 94)"],
        colorDomain: [0,10]
    }

    this.buildLegendData();
  }

  componentDidMount() {
        this.draw();
      }

      draw() {
        if (!this.state.hasData) return;
 
        const svg1 = d3.select(".app-legend")
        .append("svg")
        //.attr("width", 100)
        .attr("height", 300);              

        svg1.append("g")
        .attr("class", "legendSize")
        .attr("transform", "translate(20, 20)");
      
        const svg2 = d3.select(".app-legend")
        .append("svg")
        .attr("width", 700)
        .attr("height", 300);              

        svg2.append("g")
        .attr("class", "legendLinear")
        .attr("transform", "translate(20,20)");      

        var linearSize = d3.scaleLinear()
        .domain(this.state.sizeKeys)
        .range(this.state.sizeValues);

        //https://observablehq.com/@d3/d3-scalelinear
        var linear = d3.scaleLinear()
        .domain(this.state.colorDomain)
        .range(this.state.colorRange);
     
      var legendbySize = legendSize() 
        .scale(linearSize)
        .shape('circle')
        .shapePadding(40)
        .labelWrap(30)
        .labelOffset(20)
        .orient('horizontal');
    
      svg1.select(".legendSize")
        .call(legendbySize);

      var legendLinear = legendColor()
        .shapeWidth(30)
        .labelWrap(30)
        .labels(this.state.colorDomain)
       .cells(this.state.colorDomain.length)
        .orient('horizontal')
        .scale(linear);
      
      svg2.select(".legendLinear")
        .call(legendLinear);
              
        
      }

      render() {
        console.log("render")
          return (
            <div className="app-legend">
              </div>
              )
          }

      buildLegendData() {
        var setState = this.setState.bind(this);
        var draw = this.draw.bind(this);

        global.legend.promise.then( () =>{
          //colors for range
          console.log("we have the legend values")
          console.log(global.legend.colors)
          console.log(global.legend.circles)
          var colorKeys =Object.keys(global.legend.colors);
          var colorValues=Object.values(global.legend.colors).map((v)=> hexToRgb(v));
          
          var sizeKeys =Object.keys(global.legend.circles);
          var sizeValues=Object.values(global.legend.circles);
          

          setState({
            colorDomain: colorKeys,
            colorRange: colorValues,
            sizeKeys: sizeKeys,
            sizeValues: sizeValues,
            hasData: true

          })

          draw();
        })            
      }
    }


    function hexToRgb(hex) {
      // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
      var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
      });
    
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? 
       "rgb(" + parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16) + ")"      
      : null;
    }
    

export default Legend