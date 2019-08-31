# The App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## The Stack

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


##  Modules

* grid_graph


## Debugging

### Electron process

### Render process



Before you can run any of these scripts you need to install the required modules using:

```js
npm install -g yarn
npm install
```

In the project directory (the **app** directory), you can run:

### `npm start`

This runs the app in the development mode.<br>

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

## Contributing