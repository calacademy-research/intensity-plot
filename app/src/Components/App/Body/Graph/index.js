import React from 'react'
import Buttons from "./Buttons"
import HitBar from "./HitBar"
import { global as g, hits, names, mu } from "../../../../modules/musat_global"
import { initPrimerMinMax } from "../../../../modules/musat_global"
import { processData } from "../../../../modules/musat_process_graph_data"
import GridLocus from "../../../../modules/musat_grid_locus"
import * as data from "../../muinfo.json"
import text from "../../TG_MS1_AllelCall"
import './index.css'
import Wrapper from './Wrapper'

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
                <Wrapper />
                <HitBar />
                <canvas id="tip" className="tip-canvas"></canvas>
            </div>
        )
    }
}

export default Graph