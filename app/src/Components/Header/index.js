import React from 'react'
import './index.css'
import Title from "../Title"
import Menu from "../Menu"

function Header(props) {
    return (
        <header className="header">
            <div className="clear-both">
                <Title className="app-title"
                    title={props.title}
                />
                <Menu className="app-menu"
                    demoText={props.menuActions.demo.text}
                    buildText={props.menuActions.build.text}
                    aboutText={props.menuActions.about.text}
                    handleDemoClick={props.menuActions.demo.onClick}
                    handleBuildClick={props.menuActions.build.onClick}
                    handleAboutClick={props.menuActions.about.onClick}
                />
            </div>
        </header>
    )
}

export default Header