import React from 'react'
import './index.css'

function Menu(props) {
    return (
        <div className="app-menu">
           | <button className="menuItem" onClick={props.handleDemoClick}>{props.demoText}</button>
           | <button className="menuItem" onClick={props.handleBuildClick}>{props.buildText}</button>
           | <button className="menuItem" onClick={props.handleAboutClick}>{props.aboutText}</button>
        </div>
    )
}

export default Menu