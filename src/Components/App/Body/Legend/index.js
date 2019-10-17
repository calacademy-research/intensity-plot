import React, {Component} from 'react';
import './index.css'
import * as d3 from "d3";
import { mu } from "../../../../modules/global"
import {legendColor} from 'd3-svg-legend'

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

        //https://observablehq.com/@d3/d3-scalelinear
        var linear = d3.scaleLinear()
        .domain(this.state.colorDomain)
        .range(this.state.colorRange);
      
        const svg = d3.select(".app-legend")
        .append("svg")
        .attr("width", 700)
        .attr("height", 300);
                
      svg.append("g")
        .attr("class", "legendLinear")
        .attr("transform", "translate(20,20)");
      
      var legendLinear = legendColor()
        .shapeWidth(30)
        .cells(10)
        .orient('horizontal')
        .scale(linear);
      
      svg.select(".legendLinear")
        .call(legendLinear);
      
        console.log(this.props.legend)
        
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

        mu.legend.promise.then( () =>{
          //colors for range
          console.log("we have the legend values")
          console.log(mu.legend.colors)
          console.log(mu.legend.circles)
          var colorKeys =Object.keys(mu.legend.colors);
          var colorValues=Object.values(mu.legend.colors).map((v)=> hexToRgb(v));
          
          setState({
            colorDomain: colorKeys,
            colorRange: colorValues,
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