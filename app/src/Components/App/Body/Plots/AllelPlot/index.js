import React from 'react'
import './index.css'
import chart from "./allelplot.png"

function AllelPlot(props) {
    return (
        <div className="app-plot-allel">
            <img src={chart} alt="allel plot"/>
        </div>
    )
}

export default AllelPlot