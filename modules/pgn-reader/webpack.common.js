const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
    ],
    output: {
        filename: 'pgn.js',
        path: path.resolve(__dirname, 'lib'),
        publicPath: '/lib/',
        library: 'pgn-parser',
        libraryTarget: 'umd',
    },
};