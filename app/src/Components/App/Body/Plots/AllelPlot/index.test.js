import React from 'react'
import ReactDOM from 'react-dom'
import AllelPlot from '.'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<AllelPlot />, div)
  ReactDOM.unmountComponentAtNode(div)
})
