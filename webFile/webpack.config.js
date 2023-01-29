const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

module.exports = {
    mode: 'production',
    entry: './src/vue/index.js',
    output: {
      filename: 'main.js',
      path: path.resolve(__dirname, './src/vue_dist'),
      clean: true
    },
    module: {
        rules: [
            {
                 test:/\.vue$/,
                 use: 'vue-loader'
            },
            { 
                test: /\.css$/, 
                use:[
                    'style-loader', 
                    'css-loader'
                ]
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader',
                ]
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'static/[name][hash][ext]'
                  }
            },
            {
                test: /\.(mp4)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'static/mp4/[name][hash][ext]'
                  }
            },
            {
                test: /\.(mp3|flac)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'static/mp3/[name][hash][ext]'
                  }
            },
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            filename: 'main.html',
            template: './src/vue/webpackHtmlTemplate/template.html'
        }),
        AutoImport({
            resolvers: [ElementPlusResolver()],
          }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
        require('unplugin-element-plus/webpack')({
        }),
    ],
    devServer: { // 新增devServer节点
        port: 8080,
        static: './src/vue_dist', // 告知dev server从什么位置查找
    },
    performance: {
        hints: false
    }
  };