# Intensity Plot

This project is a visualization tool for organizing microsatellite data.  It allows you to select and group allele samples that are related.

The visualization component itself is a written in javascript, using react components.  The visualization is hosted in an Electron application shell, but could be re-used in a different application.

## Getting Started

These instructions will get the project up and running on your machine for use, development, or testing.

### Prerequisites

Before you can run any of these scripts you need to install the required modules using:

```js
npm install -g yarn
npm install
```

### Runing

In the project directory (the **app** directory), you can run:

### `npm start`

This runs the app as an React generated single page in a browser. The URL is "http://localhost:3000".

### `npm run start-both`

This runs the React client page inside an Electron brwoser window.

### `npm run satrt-electron`

This runs the Electron app but does not trigger the React code generation.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.


## Built With

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

* Electron 
    * [Quick Start](https://github.com/electron/electron-quick-start)
    * An open-source framework designed to build desktop GUI applications using HTML, CSS and JavaScript.
    * Runs using Node.js runtime for the back-end part and Chromium for the front-end. 
    * Electron exposes full access to Node.js both in the main and the renderer process. 
* [ES6 Modules](https://ponyfoo.com/articles/es6-modules-in-depth)
    * Each module is a small unit of independent, reusable code. 
    * Each module is a piece of code that is executed once a JavaScript file is loaded
    * Everything inside an ES6 module is private by default, and runs in strict mode (there’s no need for 'use strict').
    * Public variables, functions and classes are exposed using export.
    * Exposed modules are called into other modules using import.
    * Modules must be included in your HTML with type="module", which can be an inline or external script tag.
    * Modules are deferred, and only run after a document is loaded
* npm (yarn)
* GraphViz

## Application Architecture

* package.json - Points to the app's main file and lists its details and dependencies.
* electron.js - Starts the app and creates a browser window to render HTML. This is the app's main process.
* index.html - A web page to render. This is the app's renderer process.

## Modules

* grid_graph

## Debugging

### Electron process

### Render process

## Learn More

## Contributing

Thank you for your interest in contributing to this project.  For contribution guidelines and our Code of Conduct, see [CONTRIBUTING.MD](CONTRIBUTING.MD)