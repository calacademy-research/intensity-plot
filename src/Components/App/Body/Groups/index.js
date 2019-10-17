import React from 'react'
import './index.css'
import Group from "./Group"
import { MAX_GROUPS } from "../../../../modules/groups"

function Groups() {
    let groups = []
    for (let i = 1; i < MAX_GROUPS; i++) {
        groups.push(`group${i}`)
    }
    let groupList = groups.map((group, index) => {
        return <Group key={group} id={group} groupId={index + 1} />
    })
    return (
        <div className="app-plot-groups">
            <div className="custom-group-title">Custom Groups</div>
            <div className="groups-container" id="group-container">
                {groupList}
            </div>
            </div>
    )
}

export default Groups