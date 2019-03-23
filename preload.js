let fs = require('fs')
const { dialog } = require('electron').remote
const { BrowserWindow } = require('electron').remote

window.readDir = function(path, options) {
    // return as fs.Dirent obj
    return fs.readdirSync(path, options)
}

window.readFileStat = function(file) {
    return fs.statSync(file)
}

window.renameFile = function(oldFile, newFile) {
    return fs.renameSync(oldFile, newFile)
}

window.openFolder = function() {
    return dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), { properties: ['openDirectory'] })
}

window.onPluginEnterSync = function() {
    return new Promise((resolve, reject) => {
        utools.onPluginEnter(resolve)
    })
}
