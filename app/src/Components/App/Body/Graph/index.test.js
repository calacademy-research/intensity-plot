import React from 'react'
import ReactDOM from 'react-dom'
import Graph from '.'

it('renders without crashing', () => {
  const div = document.createElement('div')
  let graphData = { fileName: "test data" }
  let graphActions = {}
  ReactDOM.render(<Graph graphData={graphData} graphActions={graphActions} />, div)
  ReactDOM.unmountComponentAtNode(div)
})
