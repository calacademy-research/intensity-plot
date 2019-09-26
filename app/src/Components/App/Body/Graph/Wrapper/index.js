import React from 'react'
import './index.css'

function Wrapper(props) {
    return (
        <div id="graph_wrapper" className="noselect graph-wrapper">
            <div id="all_graphs">
                <div id="graph_and_labels0" className="graph-and-labels">
                    <div id="graph_container0">
                        <div id="mainCanvasContainer0" className="main-canvas-container">
                            <canvas id="mainCanvas0" className="canvas0 main-canvas"></canvas>
                            <canvas id="mainCanvasBackground0" className="main-canvas-background"></canvas>
                        </div>
                        <canvas id="sample_names0" className="canvas0 sample-names"></canvas>
                    </div>
                    <canvas id="length_labels0" className="canvas0"></canvas>
                </div>
            </div>
        </div>
    )
}

export default Wrapper