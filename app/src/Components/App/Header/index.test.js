import React from 'react'
import ReactDOM from 'react-dom'
import Header from '.'

it('renders without crashing', () => {
  const div = document.createElement('div')
  let menuActions = {
    demo: {
      text: "dmeo",
      onClick: () => "return true",
    },
    build: {
      text: "build",
      onClick: () => "return true",
    },
    about: {
      text: "about",
      onClick: () => "return true",
    },
  }
  ReactDOM.render(<Header title="app title"
  menuActions = {menuActions}
  />, div)
  ReactDOM.unmountComponentAtNode(div)
})
