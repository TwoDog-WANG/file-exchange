const http = require('http');
const fs = require('fs');

const _path = 'F:/ACG/电影/烈日灼心The.Dead.End.2015.1080p.WEB-DL.x264.AAC-PianYuan/The.Dead.End.2015.1080p.WEB-DL.x264.AAC-PianYuan.mp4';

http.createServer(async (req, res) => {
    if(req.url == '/') {
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.end(
            `
                <video src="/video" width="600" controls='controls'></video>
            `
        )
    }
    else if(req.url == '/video') {
        let range = req.headers['range'];
        if(!range) {
            fs.createReadStream(_path).pipe(res)
        }
        else {
            let stats = await fs.promises.stat(_path);
            let position = range.replace(/bytes=/, "").split("-");
            let start = parseInt(position[0], 10);
            let end = position[1] ? parseInt(position[1], 10) : start + 1024 * 1024;
            if(end > stats.size - 1) {
                end = stats.size - 1;
            }

            let head = {
                // 'Content-Type': 'video/mp4',
                "Content-Range": `bytes ${start}-${end}/${stats.size}`,
                "Content-Length": end - start + 1,
                "Accept-Ranges": "bytes",
            }

            res.writeHead(206, head);

            fs.createReadStream(_path, {start: start, end: end}).pipe(res)
        }
    }
}).listen(3000, () => {
    console.log('listen 3000');
})