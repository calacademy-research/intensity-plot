import React from 'react'
import ReactDOM from 'react-dom'
import IntensityPlot from '.'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<IntensityPlot />, div)
  ReactDOM.unmountComponentAtNode(div)
})
