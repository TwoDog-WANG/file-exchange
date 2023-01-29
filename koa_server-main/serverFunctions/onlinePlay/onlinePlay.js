const fs = require('fs');
const bodyParse = require('../../nodeBodyParse.js');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath('E:/ffmpeg-2023-01-04-git-4a80db5fc2-full_build/bin/ffmpeg.exe');

const onlinePlay = async (req, res) => {
    let _path = decodeURI(req.url).replace('/onlinePlay/', '');
    let stats = await fs.promises.stat(_path);
    let range = req.headers['range'];

    if(!range) {
        let movieStream = fs.createReadStream(_path);
        let head = {
            'Content-Type': 'application/octet-stream',
            "Content-Length": stats.size,
        }
        res.writeHead(200, head);
        movieStream.pipe(res);
    }
    else {
        let position = range.replace(/bytes=/, "").split("-");
        let start = parseInt(position[0], 10);
        let end = position[1] ? parseInt(position[1], 10) : start + 1024 * 1024 * 100;
        if(end > stats.size - 1) {
            end = stats.size - 1;
        }
        let movieStream = fs.createReadStream(_path, {start, end})
        let head = {
            'Content-Type': 'application/octet-stream',
            "Content-Range": `bytes ${start}-${end}/${stats.size}`,
            "Content-Length": end - start + 1,
            "Accept-Ranges": "bytes",
        }

        res.writeHead(206, head);
        movieStream.pipe(res)
    }
}
const getTrack = async (req, res) => {
    let body = await bodyParse(req);
    const dir = body.dir;
    const saveDir = 'F:/movieCatch/noSlice.vtt';
    await new Promise((resolve, reject) => {
        command = ffmpeg(dir)
        .on('start', () => {
            console.log('ffmpeg start change sub');
        })
        .on('error', (err, stdout, stderr) => {
            console.log(err);
            console.log("stderr:\n" + stderr);
            reject(err);
        })
        .on('end', () => {
            console.log('ffmpeg change sub end');
            resolve();
        })
        .save(saveDir)
    });
    const _buffer = await fs.promises.readFile(saveDir);
    const stats = await fs.promises.stat(saveDir);
    res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Length': stats.size
    });
    res.end(_buffer);
}

module.exports = {
    'GET /onlinePlay/:path': onlinePlay,
    'POST /gettrack': getTrack,
}