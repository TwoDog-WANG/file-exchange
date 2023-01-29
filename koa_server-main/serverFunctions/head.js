const fs = require('fs');

// const getHead = async (ctx, next) => {
//     // let data = await fs.promises.readFile('../webFile/src/vue_dist/main.html', 'utf-8');
//     let data = await fs.promises.readFile('./test.html', 'utf-8')
//     ctx.response.statue = 200;
//     ctx.response.type = 'text/html';
//     ctx.response.body = data;
// }

// const getMainJS = async (ctx) => {
//     let data = await fs.promises.readFile('../webFile/src/vue_dist/main.js', 'utf-8');
//     ctx.response.statue = 200;
//     ctx.response.type = 'application/x-javascript';
//     ctx.response.body = data;
// }
const getHead = async (req, res) => {
    let data = await fs.promises.readFile('../webFile/src/vue_dist/main.html', 'utf-8');
    // let data = await fs.promises.readFile('./test.html', 'utf-8');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(data)
}

const getMainJS = async (req, res) => {
    let data = await fs.promises.readFile('../webFile/src/vue_dist/main.js', 'utf-8');
    res.writeHead(200, {'Content-Type': 'application/x-javascript'});
    res.end(data);
}

module.exports = {
    'GET /': getHead,
    'GET /main.js': getMainJS,
}