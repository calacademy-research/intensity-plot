import React from 'react'
import './index.css'

function Wrapper(props) {
    let gId = props.groupId
    return (
        <div id="graph_wrapper" className="noselect graph-wrapper">
            <div id="all_graphs">
                <div id={"graph_and_labels" + gId} className="graph-and-labels">
                    <div id={"graph_container" + gId}>
                        <div id={"mainCanvasContainer" + gId} className="main-canvas-container">
                            <canvas id={"mainCanvas" + gId} className="canvas main-canvas"></canvas>
                            <canvas id={"mainCanvasBackground" + gId} className="main-canvas-background"></canvas>
                        </div>
                        <canvas id={"sample_names" + gId} className="canvas sample-names"></canvas>
                    </div>
                    <canvas id={"length_labels" + gId} className="canvas"></canvas>
                </div>
            </div>
        </div>
    )
}

export default Wrapper