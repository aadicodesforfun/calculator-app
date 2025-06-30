const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

function createWindow() {
  const window = new BrowserWindow({
    height: 490,
    width: 280,
    frame: false,
    resizable: false,
    transparent: true,
    icon: process.platform === 'darwin'
    ? path.join(__dirname, 'assets', 'icon.icns')
    : path.join(__dirname, 'assets', 'icon.ico'),
    // titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  window.loadFile("index.html");
}

app.whenReady().then(createWindow);

ipcMain.on("close-window", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
});

ipcMain.on("minimize-window", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.minimize();
});
