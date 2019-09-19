import React from 'react'
import './index.css'
import Group from "./Group"

function Groups(props) {
    let groups = props.groups
    let groupList = groups.map((group) => {
        return <li key={group} ><Group index={group} /></li>
    })
    return (
        <div className="app-plot-groups">
                <div className="clear-both">
                Custom Groups
               </div>
               <ul>{groupList}</ul>
        </div>
    )
}

export default Groups