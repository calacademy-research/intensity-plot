import React from 'react'
import './index.css'

let Buttons = (props) => (
    <div id="buttons" className="buttons">
        <button id="addGroup" onClick={props.graphActions.addGroup}>Add group</button>
        <button id="removeGroup" onClick={props.graphActions.removeGroup}>Remove group</button>
        <div id="gridGraphSelector" className="plot-grid-selector" />
    </div>
)

export default Buttons