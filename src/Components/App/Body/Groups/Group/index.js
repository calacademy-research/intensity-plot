import React from 'react'
import './index.css'
import HitBar from "../../Graph/HitBar"
import Wrapper from "../../Graph/Wrapper"

function Group(props) {
    return (
        <div id={"group" + props.groupId} className="app-plot-group hidden-group">
            <Wrapper groupId={props.groupId} className="group-graph"/>
            <HitBar groupId={props.groupId} />
        </div>
    )
}

export default Group