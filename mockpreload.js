window.readDir = async function(path) {
    return [
        "abc.jpg", "bdfd.jpg",
        "abce.jpg", "bdfdcc.jpg",
        "abcs.jpg", "bdfdc.jpg",
        "abc.pdf", "bfdf.pdf",
        "fadfa.exe", "frfasdf"
    ]
}

window.readFileStat = function(path) {
    return { 
        "dev": 4228118161, 
        "mode": 33206, 
        "nlink": 1, 
        "uid": 0, 
        "gid": 0, 
        "rdev": 0, 
        "ino": 13510798882116062, 
        "size": 20831197, 
        "atimeMs": 1553090168762.6096, 
        "mtimeMs": 1513138981702.2937, 
        "ctimeMs": 1513249845440.7776, 
        "birthtimeMs": 1513138980952.26, 
        "atime": "2019-03-20T13:56:08.763Z", 
        "mtime": "2017-12-13T04:23:01.702Z", 
        "ctime": "2017-12-14T11:10:45.441Z", 
        "birthtime": "2017-12-13T04:23:00.952Z" }
}

window.renameFile = function(files) {
    return true
}

window.openFolder = async function() {
    return dialog.showOpenDialog({ properties: ['openDirectory'] })
}