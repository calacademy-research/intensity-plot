import React from 'react'
import Buttons from "./Buttons"
import Wrapper from './Wrapper'
import HitBar from "./HitBar"
import { g, hits, names, mu } from "../../../../modules/musat_global"
import { initPrimerMinMax } from "../../../../modules/musat_global"
import { processData } from "../../../../modules/musat_process_graph_data"
import GridLocus from "../../../../modules/musat_grid_locus"
import * as data from "../../muinfo.json"
import text from "../../TG_MS1_AllelCall"
import './index.css'

class Graph extends React.Component {
    constructor(props) {
        super(props)
        mu.oLocusCalls = data.oLocusCalls
        initPrimerMinMax(); // 10May2016
        processData(text.split("\n"));

        this.state = {
            title: "muSat Intensity Plots",
            graphData: props.graphData,
            graphActions: props.graphActions,
            menuActions: props.menuActions,
            groupId: 0,
        }
    }

    componentDidMount() {
        const fileName = this.state.graphData.fileName
        new GridLocus(
            fileName,
            hits,
            g.primer_min, g.primer_max,
            names,
            fileName);
    }

    render() {
        return (
            <div className="app-plot">
                <div className="clear-both">
                    {this.state.graphData.fileName}
                </div>
                <Buttons />
                <Wrapper groupId={this.state.groupId} />
                <HitBar groupId={this.state.groupId} />
                <canvas id="tip" className="tip-canvas" height="20" width="170"></canvas>
            </div>
        )
    }
}

export default Graph