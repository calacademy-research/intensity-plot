import React from 'react'
import './index.css'
import chart from "./insectNames.png"

function InsectNames(props) {
    return (
        <div className="app-plot-insect">
            <img src={chart} alt="insect names"/>
        </div>
    )
}

export default InsectNames