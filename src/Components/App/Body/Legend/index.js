import React, {Component} from 'react';
import './index.css'
import * as d3 from "d3";
import { mu } from "../../../../modules/global"
import {legendColor} from 'd3-svg-legend'

class Legend extends Component {
  constructor(props) {
    super(props)
    this.state = {
        colorRange: ["rgb(46, 73, 123)", "rgb(71, 187, 94)"],
        colorDomain: [0,10]
    }

    this.buildLegendData();
  }

  // componentDidUpdate(){
  //   this.draw();
  // }
    componentDidMount() {
        this.draw();
      }

      draw() {
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
        var setState = this.setState;

        mu.legend.promise.then( () =>{
          //colors for range
          console.log("we have the legend values")
          console.log(mu.legend.colors)
          console.log(mu.legend.circles)
          console.log(Object.keys(mu.legend.colors).length)
          setState({
            colorDomain: [1, Object.keys(mu.legend.colors.length)],
            colorRange: mu.legend.colors
          })
          
        })
      
      
      }

    }





export default Legend