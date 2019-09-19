import React from 'react'
import ReactDOM from 'react-dom'
import Groups from '.'

it('renders without crashing', () => {
  const div = document.createElement('div')
  const plotData = {fileName: "test data"}
  const plotActions = {}
  const groups = ["curly", "larry", "moe"]
  ReactDOM.render(<Groups groups={groups} plotData={plotData} plotActions={plotActions}/>, div)
  ReactDOM.unmountComponentAtNode(div)
})
