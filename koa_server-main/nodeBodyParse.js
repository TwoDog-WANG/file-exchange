async function bodyParse(req) {
    const body = await new Promise((resolve, reject) => {
        let body = ''
        req.on('data', (chunk) => {
            body = body + chunk;
        })
        req.on('end', () => {
            body = JSON.parse(body);
            resolve(body);
        }) 
    });
    return body
}

module.exports = bodyParse;