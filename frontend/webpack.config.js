const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        bundle: [
            'jquery',
            'datatables.net',
            'angular',
            'angularjs-datatables',
            './app/app.js',
            './app/styles.css'
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/bundle.js',
        clean: true
    },
    module: {
        rules: [
            {
                test: require.resolve('datatables.net'),
                use: 'imports-loader?jQuery=jquery'
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
        new MiniCssExtractPlugin({
            filename: 'css/styles.css'
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'index.html',
                    to: 'index.html'
                }
            ]
        })
    ]
};

