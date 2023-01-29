const fs = require('fs');

const bodyParse = require('../../nodeBodyParse.js');
const getImgByManhua = async (req, res) => {
    let body = await bodyParse(req);
    const dir = body.dir;
    try {
        const img = await fs.promises.readFile(dir);
        const stats = await fs.promises.stat(dir);
        res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Length': stats.size
        });
        res.end(img);
    } catch (err) {
        console.log(err);
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end('不存在');
    }
}

module.exports = {
    'POST /getImgByManhua': getImgByManhua,
}