const webpack = require('webpack');
const { resolve }  = require('path');

module.exports = {
    entry: "./assets/src/main.ts",
    output: {
        path: resolve(__dirname, "assets/js/"),
        filename: "bundle.js"
    },
    resolve: {
        extensions: [".webpack.js", ".web.js", ".ts", ".js"],
        alias: {
            'rxjs': 'rxjs'
        }
    },
    module: {
        rules: [
            { test: [/\.ts$/],  loader: 'ts-loader' }
        ]
    },
    plugins: [
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)@angular/,
            resolve(__dirname, 'assets/src/')
        )
    ],
	// watch: process.env.NODE_ENV === 'development'
};