const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    target: "node",
    entry: {
        app: './src/pgn.js'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'Production',
        }),
        new CopyWebpackPlugin([
            {from: 'src/img', to: 'img', toType: 'dir'},
            {from: 'src/locales', to: 'locales', toType: 'dir'}
        ]),
    ],
    output: {
        filename: 'pgn.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist/',
        library: 'pgn-parser',
        libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
        ],
    },
};