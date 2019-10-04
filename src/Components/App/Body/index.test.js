import React from 'react'
import ReactDOM from 'react-dom'
import Body from '.'

it('renders without crashing', () => {
  const div = document.createElement('div')
  const graphData = {
    fileName: "test file",
    legend: "test legend",
    currentInstructions: "test instructions"
  }
  ReactDOM.render(<Body graphData={graphData}/>, div)
  ReactDOM.unmountComponentAtNode(div)
})
