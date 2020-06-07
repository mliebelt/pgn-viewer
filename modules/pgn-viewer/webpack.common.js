const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WebpackRequireFrom = require("webpack-require-from");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        app: './src/index.js'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new WebpackRequireFrom({
            // path: 'https://custom.domain',
            variableName: "__globalCustomDomain",
            // methodName: "__globalCustomDomain",
            // replaceSrcMethodName: "__replaceWebpackDynamicImport",
            suppressErrors: true
        }),
        new CopyWebpackPlugin([
            {from: 'src/locales', to: 'locales', toType: 'dir'}
        ])
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
                        loader: 'file-loader',
                        options: {
                            outputPath: 'pgnv-assets',
                        },
                    }
                ]
            }
        ],
    },
};