import React from 'react'
import './index.css'

function Footer(props) {
    return (
        <footer className="footer">
            <div className="clear-both">We are using React <span id="react-version">{props.reactVersion}</span>,
            Node.js <span id="node-version"></span>,
            Chromium <span id="chrome-version"></span>,
            and Electron <span id="electron-version"></span>.
            </div>
        </footer>
    )
}

export default Footer