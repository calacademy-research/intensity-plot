import React from 'react'
import Legend from "./Legend"
import Instructions from "./Instructions"
import Graph from "./Graph"
import Groups from "./Groups"
import './index.css'

function Body(props) {
    return (
        <div className="app-body">
            <div className="clear-both">
                <Legend
                    legend={props.graphData.legend}
                />
                <Instructions
                    instructions={props.graphData.currentInstruction}
                />
            </div>
            <div className="clear-both">
                <Graph
                    graphData={props.graphData}
                    graphActions={props.graphActions}
                />
                <Groups
                    graphData={props.graphData}
                    graphActions={props.graphActions}
                    groups={["Bashful", "Doc", "Dopey", "Grumpy", "Happy", "Sleepy", "Sneezy"]}
                />
            </div>
        </div>
    )
}

export default Body