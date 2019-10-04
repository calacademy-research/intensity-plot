import React from 'react'
import ReactDOM from 'react-dom'
import Instructions from '.'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<Instructions instructions="The quick brown fox jumps over the lazy dog."/>, div)
  ReactDOM.unmountComponentAtNode(div)
})
