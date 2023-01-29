const http = require('http');
const path = require('path');

const nodeRouter = require('./nodeRouter');

let server = http.createServer(async (req, res) => {
    nodeRouter(req, res);
})

server.listen(3000, () => {
    console.log('server listen 3000');
})

function getServer() {
    return server
}

exports.getServer = getServer;