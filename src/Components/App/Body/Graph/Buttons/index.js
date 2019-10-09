import React from 'react'
import './index.css'

let Buttons = (props) => (
    <div id="buttons" className="graph-menu">
        <ul className="graph-menu-list">
            <li  className="graph-menu-item" id="addGroup" onClick={props.graphActions.addGroup}>Add group</li>
            <li  className="graph-menu-item" id="removeGroup" onClick={props.graphActions.removeGroup}>Remove group</li>
            <li  className="graph-menu-item">
                <div id="gridGraphSelector" className="plot-grid-selector" />
            </li>
        </ul>
        
    </div>
)

export default Buttons