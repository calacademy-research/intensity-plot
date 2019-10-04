import React from 'react'
import './index.css'

function Menu(props) {
    return (
        <div className="app-menu">
	        <ul className="app-menu-list">
			   <li className="app-menu-item" onClick={props.handleDemoClick}>{props.demoText}</li>
	           <li className="app-menu-item" onClick={props.handleBuildClick}>{props.buildText}</li>
	           <li className="app-menu-item" onClick={props.handleAboutClick}>{props.aboutText}</li>
			</ul>
        </div>
    )
}

export default Menu