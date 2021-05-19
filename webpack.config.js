const path = require('path');
const webpack = require('webpack');
// const HtmlWebpackPlugin = require('html-webpack-plugin')




module.exports = {
    cache: true,
    // debug: true,

    // генерировать map файл
    // devtool: 'source-map',
    target: 'es5',
    stats: {
        colors: true,
        reasons: true
    },

    // Точка входа
    entry: {
        rabbit: './modules/main.js',
    },

    // подключаем лоадеры
    module: {
        rules: [
            // { test: /\.svg$/, use: 'svg-inline-loader' },
            // { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            // {
            //     test: /\.(js)$/,
            //     use: 'babel-loader'
            // },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components|resources|images|fonts|css|\.png|\.jpeg|\.mp3|\.json)/, //excluded node_modules 
                use: {
                    loader: "babel-loader",
                    options: {
                        babelrc: false,
                        // подключаем плагин для распрарсивания свойств в теле класса
                        plugins: ["dynamic-import-webpack","@babel/plugin-proposal-class-properties"],
                        // пресет 
                        presets: ["@babel/preset-env"] //Preset used for env setup
                    }
                }
            }
        ],
    },

    // выходной бандл
    output: {
        path: path.resolve(__dirname, 'dist/'),
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.js']
    },

    // пробросим на выход
    // resolve: {
    //     extensions: ['.js'],
    //     alias: {
    //         'Game': path.resolve(__dirname, './source/class.game.js') // <-- When you build or restart dev-server, you'll get an error if the path to your utils.js file is incorrect.
    //     }
    // },

    // подключаем плагины
    plugins: [
        // new HtmlWebpackPlugin(),
        // new webpack.EnvironmentPlugin({
        //     'NODE_ENV': 'production'
        // }),
        // new webpack.ProvidePlugin({
        //     'Game': 'Game'
        // })
    ],
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
}