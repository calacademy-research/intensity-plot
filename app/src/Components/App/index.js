import React from 'react'
import Footer from "./Footer"
import Header from "./Header"
import Body from "./Body"
import './index.css'

import SampleText from "./TG_MS1_AllelCall.js"
import * as data from "./muinfo.json"

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            title: "muSat Intensity Plots",
            graphData: buildGraphData(),
            graphActions: buildGraphActions(),
            menuActions: buildMenuActions(),
        }
    }

    render() {
        return (
            <div className="app">
                <Header className="app-header"
                    title={this.state.title}
                    menuActions={this.state.menuActions}
                />
                <Body className="app-body"
                    graphData={this.state.graphData}
                    graphActions={this.state.graphActions}
                />
                <Footer className="app-footer"
                    reactVersion={React.version}
                />
            </div>
        )
    }
}

function buildMenuActions() {
    return {
        demo: {
            text: "Basic Demo",
            onClick: (event) => {
                window.alert(`Menu item ${event.target.innerText} clicked`)
            },
        },
        build: {
            text: "Build Your Own",
            onClick: (event) => {
                window.alert(`Menu item ${event.target.innerText} clicked`)
            },
        },
        about: {
            text: "About",
            onClick: (event) => {
                window.alert(`Menu item ${event.target.innerText} clicked`)
            },
        }
    }
}

let buildGraphActions = () => ({
    one: () => { console.log("graphActionOne") },
    two: () => { console.log("graphActionTwo") },
    addGroup: (event) => { console.log("action addGroup", event) },
    removeGroup: (event) => { console.log("action removeGroup", event) },
})

let buildGraphData = () => ({
        fileName: "TG_MS1",
        legend: "||XXX||XXX||XXX||XXX||",
        currentInstruction: "The quick brown fox jumps over the lazy dog.",
        text: SampleText,
        data: data
    })

export default App