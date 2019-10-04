import React from 'react'
import ReactDOM from 'react-dom'
import Menu from '.'

it('renders without crashing', () => {
  let clickHandler = (e) => {window.alert('click!')}
  const div = document.createElement('div')
  ReactDOM.render(
    <Menu
      demoText="demo"
      buildText="build"
      aboutText="about"
      handleDemoClick={clickHandler}
      handleBuildClick={clickHandler}
      handleAboutClick={clickHandler}
    />, div)
  ReactDOM.unmountComponentAtNode(div)
})
