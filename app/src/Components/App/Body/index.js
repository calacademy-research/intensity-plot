import React from 'react'
import './index.css'
import Legend from "./Legend"
import Instructions from "./Instructions"
import Plots from "./Plots"
import Groups from "./Groups"

function Body(props) {
    return (
        <div className="app-body">
            <div className="clear-both">
                <Legend
                    legend={props.plotData.legend}
                />
                <Instructions
                    instructions={props.plotData.currentInstruction}
                />
            </div>
            <div className="clear-both">
                <Plots
                    plotData={props.plotData}
                    plotActions={props.plotActions}
                />
                <Groups
                    plotData={props.plotData}
                    plotActions={props.plotActions}
                    groups={["Bashful", "Doc", "Dopey", "Grumpy", "Happy", "Sleepy", "Sneezy"]}
                />
            </div>
        </div>
    )
}

export default Body