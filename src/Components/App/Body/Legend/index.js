import React, {Component} from 'react';
import './index.css'
import * as d3 from "d3";
import {legendColor} from 'd3-svg-legend'

class Legend extends Component {

    componentDidMount() {
        this.draw();
      }

      draw() {
        var linear = d3.scaleLinear()
        .domain([0,10])
        .range(["rgb(46, 73, 123)", "rgb(71, 187, 94)"]);
      
        const svg = d3.select(".app-legend")
        .append("svg")
        .attr("width", 700)
        .attr("height", 300);
        //.style("margin-left", 100);
        //var svg = d3.select("svg");
      
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
          return (
            <div className="app-legend">
              Legend
              </div>
              )
          }
}


export default Legend