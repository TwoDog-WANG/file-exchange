const fs = require('fs');
const compressing = require('compressing');

const bodyParse = require('../../nodeBodyParse.js');

// const getFiles = async (ctx, next) => {
//     const dir = ctx.request.body.dir;
//     try {
//         let fileList = await fs.promises.readdir(`${dir}`);
//         let infoList = fileList.map((file) => {
//             try {
//                 let state = fs.statSync(`${dir}${file}`);
//                 let size = (state.size / 1024 / 1024).toFixed(2);
//                 if(state.isFile()) {
//                     const musicReg = new RegExp('(mp3)$|(wma)$|(aac)$|(flac)$|(ape)$', 'i');
//                     const imgReg = new RegExp('(jpeg)$|(png)$|(webp)$|(gif)$|(jfif)$|(jpg)$|(raw)$', 'i');
//                     const movReg = new RegExp('(mkv)$|(mp4)$|(avi)$', 'i');
//                     if(musicReg.test(file)) {
//                         return {
//                             dir: file,
//                             type: 'music',
//                             id: state.birthtimeMs,
//                             size
//                         }
//                     }
//                     else if(imgReg.test(file)) {
//                         return {
//                             dir: file,
//                             type: 'img',
//                             id: state.birthtimeMs,
//                             size
//                         }
//                     }
//                     else if(movReg.test(file)) {
//                         return {
//                             dir: file,
//                             type: 'movie',
//                             id: state.birthtimeMs,
//                             size
//                         }
//                     }
//                     else {
//                         return {
//                             dir: file,
//                             type: 'file',
//                             id: state.birthtimeMs,
//                             size
//                         }
//                     }
//                 }
//                 else {
//                     return {
//                         dir: `${file}/`,
//                         type: 'folder',
//                         id: state.birthtimeMs,
//                         size: null
//                     }
//                 }
//             } catch (err) {
//                 return undefined
//             }

//         })  
//         infoList = infoList.filter((val) => {
//             return val
//         })
//         ctx.response.status = 200;
//         ctx.response.type = 'application/json';
//         ctx.response.body = infoList;
//     } catch (err) {
//         console.log(err);
//         ctx.response.status = 404;
//         ctx.response.type = 'text/html';
//         ctx.response.body = '不存在';
//     }

// }

// const downloadFile = async (ctx) => {
//     const dir = ctx.request.body.dir;
//     try {
//         const compDir = `${dir}`;
//         const _buffer = await fs.promises.readFile(compDir);
//         const stats = await fs.promises.stat(compDir);
//         ctx.response.status = 200;
//         ctx.response.length = stats.size;
//         ctx.response.body = _buffer;
//     } catch (err) {
//         console.log(err);
//         ctx.response.status = 404;
//         ctx.response.type = 'text/html';
//         ctx.response.body = '不存在';
//     }
// }

// const downloadFileByStream = async (ctx) => {
//     // let state = await fs.promises.stat('');
//     // let fileOut = fs.createReadStream('');
//     // let zip = zlib.createGzip();
//     // fileOut.pipe(zip)
//     // ctx.response.status = 200;
//     // ctx.response.body = zip;
//     const dir = ctx.request.body.dir;
//     const type = ctx.request.body.type;
//     if(type === 'folder') {
//         try {
//             await compressing.zip.compressDir(dir, './catch.zip');
//             // const bolb = await fs.promises.readFile('./catch.zip');
//             // 暂时找不到直接通过压缩流进行传输的方法
//             const stats = await fs.promises.stat('./catch.zip');
//             const fileStream = fs.createReadStream('./catch.zip');
//             ctx.response.status = 200;
//             ctx.response.length = stats.size;
//             ctx.response.body = fileStream;
//             await fs.promises.rm('./catch.zip');
//         } catch (err) {
//             console.log(err);
//             ctx.response.status = 404;
//             ctx.response.type = 'text/html';
//             ctx.response.body = '不存在';
//         }
//     }
//     else {
//         try {
//             const stats = await fs.promises.stat(dir);
//             const fileStream = fs.createReadStream(dir);
//             ctx.response.status = 200;
//             ctx.response.length = stats.size;
//             ctx.response.body = fileStream;  
//         } catch (err) {
//             console.log(err);
//             ctx.response.status = 404;
//             ctx.response.type = 'text/html';
//             ctx.response.body = '不存在';
//         }
//     }
// }

const getFiles = async (req, res) => {
    let body = await bodyParse(req);
    const dir = body.dir;
    try {
        let fileList = await fs.promises.readdir(`${dir}`);
        let infoList = fileList.map((file) => {
            try {
                let state = fs.statSync(`${dir}${file}`);
                let size = (state.size / 1024 / 1024).toFixed(2);
                if(state.isFile()) {
                    const musicReg = new RegExp('(mp3)$|(wma)$|(aac)$|(flac)$|(ape)$', 'i');
                    const imgReg = new RegExp('(jpeg)$|(png)$|(webp)$|(gif)$|(jfif)$|(jpg)$|(raw)$', 'i');
                    const movReg = new RegExp('(mkv)$|(mp4)$|(avi)$|(wmv)$', 'i');
                    if(musicReg.test(file)) {
                        return {
                            dir: file,
                            type: 'music',
                            id: state.birthtimeMs,
                            size
                        }
                    }
                    else if(imgReg.test(file)) {
                        return {
                            dir: file,
                            type: 'img',
                            id: state.birthtimeMs,
                            size
                        }
                    }
                    else if(movReg.test(file)) {
                        return {
                            dir: file,
                            type: 'movie',
                            id: state.birthtimeMs,
                            size
                        }
                    }
                    else {
                        return {
                            dir: file,
                            type: 'file',
                            id: state.birthtimeMs,
                            size
                        }
                    }
                }
                else {
                    return {
                        dir: `${file}/`,
                        type: 'folder',
                        id: state.birthtimeMs,
                        size: null
                    }
                }
            } catch (err) {
                return undefined
            }

        })  
        infoList = infoList.filter((val) => {
            return val
        })
        infoList = JSON.stringify(infoList);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(infoList);
    } catch (err) {
        console.log(err);
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end('不存在');
    }

}

const downloadFile = async (req, res) => {
    let body = await bodyParse(req);
    const dir = body.dir;
    try {
        const compDir = `${dir}`;
        const _buffer = await fs.promises.readFile(compDir);
        const stats = await fs.promises.stat(compDir);
        res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Length': stats.size
        });
        res.end(_buffer);
    } catch (err) {
        console.log(err);
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end('不存在');
    }
}

const downloadFileByStream = async (req, res) => {
    let body = await bodyParse(req);
    const dir = body.dir;
    const type = body.type;
    if(type === 'folder') {
        try {
            const zipStream = new compressing.zip.Stream();
            zipStream.addEntry(dir);
            res.writeHead(200, {
                'Content-Type': 'application/octet-stream',
            });
            zipStream.pipe(res)
            // 上面这个方法边压边传，无法获得文件的大小
            // await compressing.zip.compressDir(dir, './catch.zip');
            // const bolb = await fs.promises.readFile('./catch.zip');
            // const stats = await fs.promises.stat('./catch.zip');
            // const fileStream = fs.createReadStream('./catch.zip');
            // ctx.response.status = 200;
            // ctx.response.length = stats.size;
            // ctx.response.body = fileStream;
            // await fs.promises.rm('./catch.zip');
        } catch (err) {
            console.log(err);
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end('不存在');
        }
    }
    else {
        try {
            const stats = await fs.promises.stat(dir);
            if(stats.size > (1024 * 1024 * 1024 * 9)) {

            }
            const fileStream = fs.createReadStream(dir);
            res.writeHead(200, {
                'Content-Type': 'application/octet-stream',
                'Content-Length': stats.size
            });
            fileStream.pipe(res);
        } catch (err) {
            console.log(err);
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end('不存在');
        }
    }
}

const bigFileLoadByA = async (req, res) => {
    let dir = req.url.substring(9);
    try {
        const stats = await fs.promises.stat(dir);
        const fileStream = fs.createReadStream(dir);
        res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Length': stats.size
        });
        fileStream.pipe(res);
    } catch (err) {
        console.log(err);
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end('不存在');
    }
}

module.exports = {
    'POST /getfiles': getFiles,
    'POST /download/:path': downloadFile,
    'POST /downloadbystream/:path': downloadFileByStream,
    'GET /loadbya/:path': bigFileLoadByA,
}