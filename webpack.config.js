const path = require('path');

let CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            // {
            //     test: /\.(pgn|svg|jpg|gif)$/,
            //     use: [ 'file-loader', ]
            // },
        ],
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'img', to: 'img'}
        ]),
    ],
};