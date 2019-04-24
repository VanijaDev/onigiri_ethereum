const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: 'development',
    entry: "./js/index.js",
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'public'),
    }
};