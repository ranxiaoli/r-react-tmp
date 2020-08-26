const merge = require("webpack-merge");
const path = require("path");
const webpackConfigCreator = require("./webpack.common");

const config = {
	output: {
		filename: "js/[name][hash].js",
	},
	devServer: {
		contentBase: path.join(__dirname, "../dist"), // server模式下的output
		hot: true, // 热加载
	},
	devtool: "inline-source-map",
	resolve: {
		alias: {
			"@": path.resolve(__dirname, '../src')
		}
	}
};

const options = {
	mode: "development",
};

const webpackConfig = merge(webpackConfigCreator(options), config);
module.exports = webpackConfig


