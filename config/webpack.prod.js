const webpackConfigCreator = require("./webpack.common");
const merge = require("webpack-merge");
const optimizeCss = require("optimize-css-assets-webpack-plugin"); // 对css进行压缩
const ManifestPlugin = require("webpack-manifest-plugin");

const config = {
	output: {
		filename: "js/[name][chunkhash].js",
	},
	plugins: [
		new optimizeCss({
			cssProcessor: require("cssnano"), // ????
			cssProcessorOptions: { discardComments: { removeAll: true } },
			canPrint: true,
		}),
		new ManifestPlugin(),
	],
	devtool: "source-map",
};

const options = {
	mode: "production",
};

module.exports = merge(webpackConfigCreator(options), config);
