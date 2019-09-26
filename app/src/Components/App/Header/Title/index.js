import React from 'react'
import './index.css'
import logo from './logo.png'

function Title(props) {
    return (
        <div className="app-title">
            <img src={logo} className="title-logo" alt="logo"/>
            <span className="title-text">{props.title}</span>
        </div>
    )
}

export default Title