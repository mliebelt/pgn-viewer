const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WebpackRequireFrom = require("webpack-require-from");
const CompressionPlugin = require('compression-webpack-plugin');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    entry: {
        app: './src/index.js'
    },
    plugins: [
        //new BundleAnalyzerPlugin(),
        new CleanWebpackPlugin(),
        new CompressionPlugin(),
        new WebpackRequireFrom({
            // path: 'https://custom.domain',
            variableName: "__globalCustomDomain",
            // methodName: "__globalCustomDomain",
            // replaceSrcMethodName: "__replaceWebpackDynamicImport",
            suppressErrors: true
        })
    ],
    output: {
        filename: 'pgnv.js',
        path: path.resolve(__dirname, 'lib'),
        publicPath: '/lib/',
        library: 'PGNV',
        libraryTarget: "var",
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: [
                    {
                        loader: 'url-loader'
                    }
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [ 'url-loader'],
            },
        ],
    },
};
