import React from 'react'
import './index.css'
import HitBar from "../../Graph/HitBar"
import Wrapper from "../../Graph/Wrapper"

function Group(props) {
    return (
        <div className="app-plot-group">
            <Wrapper groupId={props.groupId} className="group-graph"/>
            <HitBar groupId={props.groupId} />
        </div>
    )
}

export default Group