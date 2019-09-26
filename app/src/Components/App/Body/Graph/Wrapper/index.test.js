import React from 'react'
import ReactDOM from 'react-dom'
import Wrapper from '.'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<Wrapper />, div)
  ReactDOM.unmountComponentAtNode(div)
})
