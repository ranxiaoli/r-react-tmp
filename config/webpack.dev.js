const merge = require("webpack-merge");
const path = require("path");
const webpackConfigCreator = require("./webpack.common");
const webpack = require("webpack");

const config = {
	output: {
		filename: "js/[name][hash].js",
	},
	devServer: {
		contentBase: path.join(__dirname, "../dist"), // server模式下的output
		hot: true, // 热加载
		historyApiFallback: true, // html5 history api, 否则404
	},
	devtool: "inline-source-map",
	plugins: [ // 开启热更新
		// new webpack.NamedModulesPlugin 被废弃了
		new webpack.HotModuleReplacementPlugin(),
	]
};

const options = {
	mode: "development",
};

const webpackConfig = merge(webpackConfigCreator(options), config);
module.exports = webpackConfig


