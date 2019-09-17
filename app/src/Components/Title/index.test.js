import React from 'react'
import ReactDOM from 'react-dom'
import Title from '.'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<Title title="Intensity Plots"/>, div)
  ReactDOM.unmountComponentAtNode(div)
})
