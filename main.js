var app = require('electron').app
var BrowserWindow = require('electron').BrowserWindow
var mainWindow = null

app.on('window-all-closed', function () {
  app.quit()
})

app.on('ready', function () {
  mainWindow = new BrowserWindow({
    webPreferences: {
      experimentalFeatures: true,
      pageVisibility: true
    }
  })
  mainWindow.loadURL('file://' + __dirname + '/index.html')
  mainWindow.on('closed', function () {
    mainWindow = null
  })
})
