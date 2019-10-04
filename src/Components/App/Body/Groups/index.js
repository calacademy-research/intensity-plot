import React from 'react'
import './index.css'
import Group from "./Group"

function Groups(props) {
    let groups = props.groups
    let groupList = groups.map((group, index) => {
        return <li key={group} ><Group groupId={index+1} /></li>
    })
    return (
        <div className="app-plot-groups">
               <div className="custom-group-title">Custom Groups</div>
               <ul className="groups-ul">{groupList}</ul>
        </div>
    )
}

export default Groups