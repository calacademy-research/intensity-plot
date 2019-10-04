import React from 'react'
import ReactDOM from 'react-dom'
import Groups from '.'

it('renders without crashing', () => {
  const div = document.createElement('div')
  const graphData = {fileName: "test data"}
  const graphActions = {}
  const groups = ["curly", "larry", "moe"]
  ReactDOM.render(<Groups groups={groups} graphData={graphData} graphActions={graphActions}/>, div)
  ReactDOM.unmountComponentAtNode(div)
})
