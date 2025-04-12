const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    entry: './src/index.ts',
    plugins: [
        //new BundleAnalyzerPlugin(),
        new CleanWebpackPlugin(),
        new CompressionPlugin(),
    ],
    output: {
        filename: 'dist.js',
        path: path.resolve(__dirname, 'lib'),
        publicPath: '/lib/',
        library: 'PGNV',
        libraryTarget: 'umd',
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@fortawesome/fontawesome-svg-core': path.resolve(__dirname, 'node_modules/@fortawesome/fontawesome-svg-core'),
            '@fortawesome/free-solid-svg-icons': path.resolve(__dirname, 'node_modules/@fortawesome/free-solid-svg-icons'),
        }
    },
    module: {
        rules: [
            {
                test: /\.ts/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                type: 'asset/inline'
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                type: 'asset/inline'
            },
        ],
    },
};
