import React from 'react'
import './index.css'
import chart from "./intensity.png"

function IntensityPlot(props) {
    return (
        <div className="app-plot-intensity">
            <img src={chart} alt="intensity plot"/>
        </div>
    )
}

export default IntensityPlot