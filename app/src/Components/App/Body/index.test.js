import React from 'react'
import ReactDOM from 'react-dom'
import Body from '.'

it('renders without crashing', () => {
  const div = document.createElement('div')
  const plotData = {
    legend: "test legend",
    currentInstructions: "test instructions"
  }
  ReactDOM.render(<Body plotData={plotData}/>, div)
  ReactDOM.unmountComponentAtNode(div)
})
