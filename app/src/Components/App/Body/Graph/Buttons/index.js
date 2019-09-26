import React from 'react'
import './index.css'

let onAddGridGraph = () => {window.alert("clicked add grid graph")}
let onRemoveGridGraph = () => {window.alert("clicked add grid graph")}

let Buttons = () => (
    <div id="buttons" className="buttons">
        <button id="addGroup" disabled onClick={onAddGridGraph}>Add group</button>
        <button id="removeGroup" disabled onClick={onRemoveGridGraph}>Remove group</button>
        <div id="gridGraphSelector" className="plot-grid-selector" />
    </div>
)

export default Buttons