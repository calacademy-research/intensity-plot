import React from 'react'
import './index.css'
import logo from './logo.png'

function Title(props) {
    return (
        <div className="app-title">
            <img src={logo} className="title-logo" alt="logo"/>
            {props.title}
        </div>
    )
}

export default Title