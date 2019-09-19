import React from 'react'
import ReactDOM from 'react-dom'
import InsectNames from '.'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<InsectNames />, div)
  ReactDOM.unmountComponentAtNode(div)
})
