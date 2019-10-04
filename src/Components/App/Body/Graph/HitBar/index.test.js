import React from 'react'
import ReactDOM from 'react-dom'
import HitBar from '.'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<HitBar />, div)
  ReactDOM.unmountComponentAtNode(div)
})
