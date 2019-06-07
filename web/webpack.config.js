const path = require("path");
const CopyWebpackPlugin = require("./node_modules/copy-webpack-plugin");

module.exports = {
    mode: 'development',
    entry: "./js/index.js",
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'public'),
    }
};