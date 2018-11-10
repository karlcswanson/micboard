const {
  app,
  BrowserWindow,
  shell,
  Menu,
  Tray
} = require('electron')
const path = require('path')

var outputready = false

let win
let tray

function createWindow() {
  win = new BrowserWindow({
    width: 290,
    height: 575
  })

  win.loadURL('http://localhost:8058/')

  win.on('closed', () => {
    win = null
  })
}

function openConfigFolder(file) {
  const configFile = path.join(app.getPath('appData'),'micboard',file)
  shell.showItemInFolder(configFile)
}


let pyProc = null

const createPyProc = () => {
  let script = path.join(__dirname, 'dist', 'micboard').replace('app.asar', 'app.asar.unpacked')
  pyProc = require('child_process').spawn(script, [], {
    stdio: ['ignore','inherit','inherit']
  })

  if (pyProc != null) {
    console.log('child process success')
  }
}

const exitPyProc = () => {
  pyProc.kill()
  pyProc = null
}

function restartMicboardServer() {
  pyProc.kill()
  pyProc = null
  setTimeout(createPyProc,250)
}


app.on('ready', () => {
  let icon = path.join(__dirname, 'build', 'iconTemplate.png').replace('app.asar', 'app.asar.unpacked')
  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    {label: 'About'},
    {type: 'separator'},
    {label: 'Launch Micboard', click () { require('electron').shell.openExternal('http://localhost:8058')}},
    {label: 'Edit Settings', click () { require('electron').shell.openExternal('http://localhost:8058/?settings')}},
    {label: 'Open Configuration Directory', click() { openConfigFolder('config.json')}},
    {type: 'separator'},
    {label: 'Restart Micboard Server', click() {restartMicboardServer()}},
    {type: 'separator'},
    {role: 'quit'}
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)
})



app.on('ready', createPyProc)
app.on('will-quit', exitPyProc)
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow)

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
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
