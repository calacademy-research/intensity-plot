import React from 'react'
import Footer from "./Footer"
import Header from "./Header"
import Body from "./Body"
import './index.css'

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            title: "muSat Intensity Plots",
            graphData: buildGraphData(),
            graphActions: buildGraphActions(this),
            menuActions: buildMenuActions(),
            gridLocus: null,
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
                    gridLocus={this.state.gridLocus}
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
                var txt = 'The Microsatellite Intensity Plot visualization tool is an open source project developed by the California Academy of Sciences, Institute for Biodiversity Science & Sustainability.  Source and documentation is available on github: https://github.com/calacademy-research/intensity-plot.';
                window.alert(txt);
            },
        }
    }
}

let buildGraphActions = (that) => ({
    setGridLocus: (gridLocus) => {
        that.setState({ gridLocus: gridLocus })
    },
    addGroup: () => {
        that.state.gridLocus.addGridGraph()
    },
    removeGroup: () => {
        that.state.gridLocus.removeGridGraph()
    },
})

let buildGraphData = () => ({
    fileName: "TG_MS1",
    legend: " : Red square = ? | Black circle = ? | Green circle = ? | Yellow Circle = ?",
    currentInstruction: "Put some sensible documentation here.",
})


export default App