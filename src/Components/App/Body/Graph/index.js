import React from 'react'
import Buttons from "./Buttons"
import Wrapper from './Wrapper'
import HitBar from "./HitBar"
import { g, hits, names, mu } from "../../../../modules/global"
import { initTraitMinMax } from "../../../../modules/global"
import { processData } from "../../../../modules/data"
import GridLocus from "../../../../modules/groups"

import text from "../../../../sampleData/TG_MS1_AllelCall"
import * as data from "../../../../sampleData/muinfo.json"
//import text from "../../../../sampleData/test1/mly-tavg-stddev.js"
//import * as data from "../../../../sampleData/test1/muinfo.json"

import './index.css'

class Graph extends React.Component {
    constructor(props) {
        super(props)
        mu.oLocusCalls = data.oLocusCalls
        initTraitMinMax(); // 10May2016
        processData(text.split("\n"));

        this.state = {
            title: "muSat Intensity Plots",
            graphData: props.graphData,
            graphActions: props.graphActions,
            menuActions: props.menuActions,
            groupId: 0,
            gridLocus: props.gridLocus,
        }
    }

    componentDidMount() {
        const fileName = this.state.graphData.fileName
        let gridLocus = new GridLocus(
            fileName,
            hits,
            g.trait_min, g.trait_max,
            names,
            fileName);
        this.state.graphActions.setGridLocus(gridLocus)
    }

    render() {
        return (
            <div className="app-plot">
                <div className="app-file-name">
                    {this.state.graphData.fileName}
                </div>
                <Buttons graphActions={this.state.graphActions} />
                <Wrapper groupId={this.state.groupId} />
                <HitBar groupId={this.state.groupId} />
                <canvas id="tip" className="tip-canvas" height="20" width="170"></canvas>
            </div>
        )
    }
}

export default Graph