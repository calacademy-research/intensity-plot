import React from 'react'
import './index.css'

let HitBar = (props) => (
    <div id="hit-bar" className="hit-bar">
        <canvas id={"hit_bars" + props.groupId}></canvas>
    </div>
)

export default HitBar