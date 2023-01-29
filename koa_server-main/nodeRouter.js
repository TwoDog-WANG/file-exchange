const fs = require('fs');
const _path = require('path');
function getJS(path = './serverFunctions') {
    let jsFilePath = [];
    let filePath = fs.readdirSync(path);
    filePath.forEach((value) => {
        if(value.endsWith('.js')) {
            jsFilePath.push(`${path}/${value}`);
        }
        else {
            let newPath = `${path}/${value}`;
            // 递归往文件内部查找后结构赋值，应该判断一下是否是文件夹
            jsFilePath.push(...getJS(newPath));
        }
    })
    return jsFilePath
}

function getFunArr() {
    let jsfiles = getJS();
    let funArr = [];
    jsfiles.forEach((value) => {
        // 获得暴露的处理函数对象
        let fns = require(value);
        for(let key in fns) {
            // 根据暴露对象的对象名来注册router
            if(key.startsWith('GET')) {
                let url = `^(${key.substring(4).replace(':path', '(\\S)+')})$`;
                let funObj = {
                    method: 'get',
                    url,
                    fun: fns[key]
                }
                funArr.push(funObj);
            }
            else if(key.startsWith('POST')) {
                let url = `^(${key.substring(5).replace(':path', '(\\S)+')})$`;
                let funObj = {
                    method: 'post',
                    url,
                    fun: fns[key]
                }
                funArr.push(funObj);
            }
        }
    })
    return funArr
}

let router = function _router() {
    const funArr = getFunArr();
    return async (req, res) => {
        const url = req.url;
        const method = req.method.toLowerCase();
        let fun = funArr.filter((funObj) => {
            let urlReg = new RegExp(funObj.url);
            if(method === funObj.method && urlReg.test(url)) {
                return true
            }
        })
        console.log(`${url} 访问`);
        if(fun.length > 0) {
            fun[0].fun(req,res);
        }
    }
}()

module.exports = router;