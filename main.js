const {
  app,
  BrowserWindow,
  shell,
  Menu,
  Tray,
} = require('electron');
const path = require('path');
const child = require('child_process');

let win;
let tray;
let pyProc = null;

function createWindow(url) {
  win = new BrowserWindow({
    width: 400,
    height: 600,
    // frame: false,
  });

  win.loadURL(url);
  // win.webContents.on('did-finish-load', function() {
 	//   win.webContents.insertCSS('.sidebar-nav{ display: none !important; }');
  // });
  win.on('closed', () => {
    win = null;
  });
}

function openConfigFolder(file) {
  const configFile = path.join(app.getPath('appData'), 'micboard', file);
  shell.showItemInFolder(configFile);
}

function openLogFile() {
  const file = path.join(app.getPath('appData'), 'micboard', 'micboard.log');
  shell.openItem(file);
}


const createPyProc = () => {
  const script = path.join(__dirname, 'dist', 'micboard-service', 'micboard-service').replace('app.asar', 'app.asar.unpacked');
  pyProc = child.spawn(script, [], {
    stdio: ['ignore', 'inherit', 'inherit'],
  });

  if (pyProc != null) {
    console.log('child process success');
  }
};

const exitPyProc = () => {
  pyProc.kill();
  pyProc = null;
};

function restartMicboardServer() {
  pyProc.kill();
  pyProc = null;
  setTimeout(createPyProc, 250);
}


app.on('ready', () => {
  const icon = path.join(__dirname, 'build', 'trayTemplate.png').replace('app.asar', 'app.asar.unpacked');
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'About', click() { createWindow('http://localhost:8058/about'); } },
    { type: 'separator' },
    { label: 'Launch Micboard', click() { shell.openExternal('http://localhost:8058'); } },
    { label: 'Edit Configuration', click() { shell.openExternal('http://localhost:8058/#settings=true'); } },
    { label: 'Open Configuration Directory', click() { openConfigFolder('config.json'); } },
    { type: 'separator' },
    { label: 'Restart Micboard Server', click() { restartMicboardServer(); } },
    { label: 'Open log file', click() { openLogFile(); } },
    { role: 'quit' },
  ]);

  tray.setToolTip('micboard');
  tray.setContextMenu(contextMenu);

  createPyProc();
  setTimeout(() => {
    shell.openExternal('http://localhost:8058');
  }, 5000);
});


// app.on('ready', createPyProc);

app.on('window-all-closed', e => e.preventDefault());

app.on('will-quit', exitPyProc);
