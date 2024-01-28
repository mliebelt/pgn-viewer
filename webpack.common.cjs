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
        fallback: {
            'crypto': false,
            'path': require.resolve('path-browserify'),
            'fs': false,
            'worker_threads': false,
            'perf_hooks': false
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
            }
        ],
    },
};
