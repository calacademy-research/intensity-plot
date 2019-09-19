import React from 'react'
import './index.css'
import IntesityPlot from "./IntensityPlot"
import AllelPlot from './AllelPlot'
import InsectNames from './InsectNames'

function Plot(props) {
    return (
        <div className="app-plot">
            <div className="clear-both">
                {props.plotData.fileName}
            </div>
            <div className="clear-both">
                <AllelPlot  className="app-plot-allel" />
                <InsectNames  className="app-plot-insect" />
            </div>
            <div className="clear-both">
                <IntesityPlot />
            </div>
        </div>
    )
}

export default Plot