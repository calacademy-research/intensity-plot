import React from 'react'
import ReactDOM from 'react-dom'
import Legend from '.'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<Legend legend="--- legends go here ---"/>, div)
  ReactDOM.unmountComponentAtNode(div)
})
