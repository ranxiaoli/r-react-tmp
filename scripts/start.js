const webpack = require("webpack");
const webpackDevServer = require("webpack-dev-server"); // 用法是什么？ 作用是什么？
const webpackConfig = require("../config/webpack.dev.js");

const compiler = webpack(webpackConfig);
const options = Object.assign({}, webpackConfig.devServer, { open: true });

const server = new webpackDevServer(compiler, options);

server.listen(3000, "127.0.0.1", () => {
	console.log("Starting server on http://localhost:3000");
});
