import React from 'react'
import './index.css'
import Footer from "./Footer"
import Header from "./Header"
import Body from "./Body"

import SampleText from "./TG_MS1_AllelCall.js"


class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            title: "muSat Intensity Plots",
            plotData: buildPlotData(),
            plotActions: buildPlotActions(),
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
                    plotData={this.state.plotData}
                    plotActions={this.state.plotActions}
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

function buildPlotActions() {
    return {
        one: () => { console.log("plotActionOne") },
        two: () => { console.log("plotActionTwo") },
        addGroup: (event) => { console.log("actionAddGroup", event) },
        delGroup: (event) => { console.log("actionDelGroup", event) },
    }
}

function buildPlotData() {
    return {
        fileName: "TG_MS1",
        legend: "||XXX||XXX||XXX||XXX||",
        currentInstruction: "The quick brown fox jumps over the lazy dog.",
        data: SampleText,
    }
}

export default App