// //生成koa实例
// const Koa = require('koa');
// const app = new Koa();

// // const add = require('./addServerFunctions');
// // const useNunjucks = require('./letAppUseNunjucks');

// // app.use(useNunjucks);
// // //使用koa-router中间件
// // app.use(add);
// //监听3000端口
// app.listen(3000);

// console.log('listen 3000');

const Koa = require('koa');

const body = require('./bodyparse.js');
const router = require('./router.js');

const app = new Koa();


app.use(body());
app.use(router.routes());

app.listen(3000, () => {
    console.log('start listen port of 3000\n--------------');
})