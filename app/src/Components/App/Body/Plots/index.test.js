import React from 'react'
import ReactDOM from 'react-dom'
import Plots from '.'

it('renders without crashing', () => {
  const div = document.createElement('div')
  let plotData = {fileName: "test data"}
  let plotActions = {}
  ReactDOM.render(<Plots plotData={plotData} plotActions={plotActions}/>, div)
  ReactDOM.unmountComponentAtNode(div)
})
