import React from 'react'
import './index.css'
import Footer from "../Footer"
import Header from "../Header"

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            title: "muSat Intensity Plots",
            fileName: "TG_MS1",
            data: null,
            menuActions: {
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
                },
            }
        }
    }
    render() {
        return (
            <div className="app">
                <Header className="app-header"
                    title={this.state.title}
                    menuActions={this.state.menuActions}
                />
                <Footer className="app-footer"
                    reactVersion={React.version}
                />
            </div>
        )
    }
}

export default App