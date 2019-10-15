import React from 'react'
import './index.css'
import Group from "./Group"
import { MAX_GROUPS } from "../../../../modules/musat_grid_locus"

function Groups() {
    let groups = []
    for (let i = 1; i < MAX_GROUPS; i++) {
        groups.push(`Group ${i}`)
    }
    let groupList = groups.map((group, index) => {
        return <li key={group} ><Group groupId={index + 1} /></li>
    })
    return (
        <div className="app-plot-groups">
            <div className="custom-group-title">Custom Groups</div>
            <ul className="groups-ul">{groupList}</ul>
        </div>
    )
}

export default Groups