// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const { exec } = require('child_process')
const yaml = require("js-yaml")
const fs = require("fs")

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);

  mainWindow.once('ready-to-show', () => { mainWindow.show() })

  if (isDev) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on("version", (event, arg) => {
  let internal_mod_flag = "3"
  let label
  exec("git rev-list --all --count",
    (err, stdout, stderr) => {
      if (err) {
        console.log("exec error", err, stderr)
        label = "unavailable"
      }
      else {
        label = stdout
      }
      let reply = `flask version 0.1.${internal_mod_flag} (commit count: ${label})`
      console.log("version ipc event, arg:", arg, "reply:", reply)
      event.reply(reply)
    })
})

ipcMain.on("step", (event, arg) => {
  let directory = arg ? arg['directory'] : null
  let step = findStepInPath(directory)
  console.log("step ipc, arg:", arg, "reply:", step)
  event.reply(step)
})

/** returns current step based on path
 * 
 * if path is not directory, step is 0
 * if path is folder, check its file names against conf
 * to determine step
 */
function findStepInPath(rawPath) {
  let normPath = path.normalize(rawPath)
  if (fs.existsSync(rawPath) && fs.lstatSync(rawPath).isDirectory()) {
    // read conf file step_definitions.yml
    try {
      let conf = yaml.safeLoad(fs.readFileSync(`${__dirname}/../conf/step_definitions.yml`))
      console.log("step_definitions", conf)
      return 1
    } catch (ex) {
      return 0
    }
  } else {
    return 0 // step 0
  }
}