const {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  Menu
} = require('electron')
const path = require('path')
const stream = require('stream')

var outputready = false


const template = [
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'pasteandmatchstyle'},
        {role: 'delete'},
        {role: 'selectall'}
      ]
    },
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'},
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },
    {
      role: 'window',
      submenu: [
        {role: 'minimize'},
        {role: 'close'}
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click () { require('electron').shell.openExternal('https://electronjs.org') }
        }
      ]
    }
  ]

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {role: 'about'},
        {type: 'separator'},
        {label: 'Edit Configuration', click() { openConfigFolder('config.json')}},
        {label: 'Add Backgrounds', click() { openConfigFolder('backgrounds')}},
        {label: 'Open Demo', click() { createDemoWindow()}},
        {type: 'separator'},
        {role: 'services', submenu: []},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
      ]
    })

    // Edit menu
    template[1].submenu.push(
      {type: 'separator'},
      {
        label: 'Speech',
        submenu: [
          {role: 'startspeaking'},
          {role: 'stopspeaking'}
        ]
      }
    )

    // Window menu
    template[3].submenu = [
      {role: 'close'},
      {role: 'minimize'},
      {role: 'zoom'},
      {type: 'separator'},
      {role: 'front'}
    ]
  }

const menu = Menu.buildFromTemplate(template)


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let consolewin
let demowin


ipcMain.on('synchronous-message', (event, arg) => {
    console.log(arg) // prints "ping"
    event.returnValue = 'pong'
  })


function createWindow() {
  win = new BrowserWindow({
    width: 290,
    height: 575
  })

  win.loadURL('http://localhost:8058/')

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

function createDemoWindow() {
  demowin = new BrowserWindow({
    width: 800,
    height: 600
  })

  demowin.loadURL('http://localhost:8058/?demo=true&start_slot=1&stop_slot=8')

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  demowin.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    demowin = null
  })
}

function updateConsole(msg) {
  if (outputready == true) {
    consolewin.webContents.send('ping', msg )
  }

}


function createConsoleWindow() {
  consolewin = new BrowserWindow({
    width: 800,
    height: 600
  })
  consolewin.loadFile('app/console.html')
  // consolewin.webContents.openDevTools()

  consolewin.webContents.on('did-finish-load', () => {
      outputready = true
  })


  consolewin.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    consolewin = null
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
    setTimeout(function() {
        createWindow()
    },500)

  }
  Menu.setApplicationMenu(menu)
}

const exitPyProc = () => {
  pyProc.kill()
  pyProc = null
}

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
