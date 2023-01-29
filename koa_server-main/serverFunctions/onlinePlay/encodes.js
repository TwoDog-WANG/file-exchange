const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath('E:/ffmpeg-2023-01-04-git-4a80db5fc2-full_build/bin/ffmpeg.exe');

const { WebSocketServer } = require('ws');
const serverFun = require('../../nodeServer.js');
let ws = null;
let command = null;
async function openWebSocket(req, res) {
    let server = serverFun.getServer();
    if(ws) {
        ws.close();
    }
    ws = new WebSocketServer({server});
    ws.on('connection', (ws) => {
        console.log('ws connection');
        let obj = {
            message: 'connection'
        }
        ws.send(JSON.stringify(obj));
        ws.on('message', async (data) => {
            let req = JSON.parse(data.toString());
            switch (req.action) {
                case 'get part':
                    const dir = req.dir;
                    let movieInf = await getMovieInf(dir);
                    getSliceMovieInf(ws, movieInf);
                    break;
                case 'encode movie':
                    const dir2 = req.dir;
                    let movieInf2 = req.parts;
                    let subDir
                    if(req.subDir) {
                        subDir = `${dir2.replace(/:/,'\\:').split('/').slice(0, -1).join('\\\\')}\\\\${req.subDir}`;
                    }
                    else {
                        subDir = undefined;
                    }
                    for (let index = 0; index < movieInf2.length; index++) {
                        await encodeMovie(movieInf2[index], dir2, index, ws, subDir)
                    }
                    let obj = {
                        message: 'finish encode'
                    }
                    ws.send(JSON.stringify(obj));
                    break;
                default:
                    break;
            }
        })
    })
    ws.on('close', () => {
        console.log('close');
    })
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('open')
}

async function getMovieInf(dir) {
    try {
        let res = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(dir, (err, data) => {
                if(data) {
                    let time = data.format.duration;
                    let size = data.format.size;
                    let movieDecode = data.streams.find((inf) => {
                        if(inf.codec_type === 'video') {
                            return true
                        }
                    }).codec_name
                    resolve({
                        time,
                        size,
                        movieDecode
                    })
                }
                else if(err) {
                    reject(err)
                }
            });
        });
        return res
    } catch (err) {
        console.log(err);
    }
}

function getSliceMovieInf(ws, movieInf) {
    let time = parseFloat(movieInf.time);
    let basTime = 1200;
    let sliceNum = Math.ceil(time / basTime);
    let sliceTime = [];
    for (let index = 0; index < sliceNum; index++) {
        let start,end;
        if(index < sliceNum - 1) {
            start = index * basTime;
            end = start + basTime;
        }
        else {
            start = index * basTime;
            end = time;
        }
        function getTime(time) {
            let hour = parseInt(time / 3600);
            let mine = parseInt((time % 3600) / 60);
            let second = ((time % 3600) % 60).toFixed(2)
            return `${hour}:${mine}:${second}`
        }
        let startTime = getTime(start);
        let endTime = getTime(end);
        let movieDecode = movieInf.movieDecode
        sliceTime.push({
            time: {
                startTime,
                endTime
            },
            duration: {
                start,
                end
            },
            movieDecode,
            status: 'init',
            progressStyle: {
                width: '0%'
            }
        })
    }
    let obj = {
        message: 'return part',
        data: sliceTime
    }
    ws.send(JSON.stringify(obj))
}

async function encodeMovie(inf, dir, index, ws, ...more) {
    let start = inf.duration.start;
    let end = inf.duration.end;
    let movieDecode = inf.movieDecode;
    let subDir = more[0];
    await new Promise((resolve, reject) => {
        command = ffmpeg(dir)
        .outputOptions([
            '-threads 5',
            '-preset ultrafast',
            '-bufsize 2000k',
            '-maxrate 2500k',
            `-ss ${start}`,
            `-to ${end}`,
            '-y'
        ])
        .videoBitrate('2000k')
        .audioCodec('aac')
        .on('start', () => {
            console.log('ffmpeg start in', index);
            let obj = {
                message: 'start part encode',
                index
            }
            ws.send(JSON.stringify(obj));
        })
        .on('error', (err) => {
            console.log(err);
            reject(err);
        })
        .on('progress', (pro) => {
            let frames = pro.frames;
            const totalFrames = (end - start) * 23.98;
            let pre = (frames / totalFrames * 100).toFixed(2);
            let obj = {
                message: 'return progress',
                data: pre,
                index
            }
            ws.send(JSON.stringify(obj));
            console.log(pre);
        })
        .on('end', () => {
            console.log('ffmpeg end');
            let obj = {
                message: 'end part encode',
                data: 100,
                index
            }
            ws.send(JSON.stringify(obj));
            resolve();
        })
        .output(`F:/movieCatch/${index+1}.mp4`)
        if(movieDecode !== 'h264' && movieDecode !== 'h265') {
            console.log(movieDecode);
            command.videoCodec('libx264')
        }
        if(subDir) {
            let vfname;
            if(subDir.endsWith('ass')) {
                vfname = 'ass'
            }
            else if(subDir.endsWith('srt')) {
                vfname = 'subtitles'
            }
            command.outputOptions([
                "-vf", `${vfname}='${subDir}'`
            ])
        }
        command.run();
    });

}

module.exports = {
    'GET /open-websocket': openWebSocket
}