import React from 'react'
import './index.css'

function Instructions(props) {
    return (
        <div className="app-instructions">
            Instructions: {props.instructions}
        </div>
    )
}

export default Instructions