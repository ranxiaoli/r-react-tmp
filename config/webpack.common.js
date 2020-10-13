const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

function webpackCommonConfigCreator(options) {
	return {
		mode: options.mode,
		entry: ['babel-polyfill', "./src/index.js"], // 入口文件
		output: {// 出口文件
			filename: "js/[name][hash].js",
			path: path.resolve(__dirname, "../server/dist"),
			publicPath: "/",
			chunkFilename: 'js/[id].[chunkhash].js'
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: path.resolve(__dirname, "../public/index.html"),
			}),
			new CleanWebpackPlugin({
				cleanOnceBeforeBuildPatterns: [
					path.resolve(process.cwd(), "build/"),
					path.resolve(process.cwd(), "dist/"),
				],
			}),
			new ExtractTextPlugin({
				filename: "css/[name][hash].css",
			}),
		],
		module: {
			rules: [
				{
					test: /\.(js|jsx)$/,
					include: path.resolve(__dirname, "../src"),
					use: [
						{
							loader: "babel-loader",
							options: {
								presets: ["@babel/preset-react"],
								plugins: ["react-hot-loader/babel", 'syntax-dynamic-import'],
							},
						},
					],
				},
				{
					test: /\.(css|less)$/,
					include: path.resolve(__dirname, "../src"),
					use: ExtractTextPlugin.extract({
						fallback: "style-loader",
						use: [
							{
								loader: "css-loader",
								options: {
									// camelCase: true, // ??? 为什么css-loader没有这个属性
									modules: {
										mode: "local",
										localIdentName: "[path][name]_[local]--[hash:base64:5]", // ???
									},

									localsConvention: "camelCase", // 文档上面找不到这个属性，设置了之后未生效
								},
							},
							{
								loader: "postcss-loader", // 对css3属性添加前缀 ???
								options: {
									indent: "postcss",
									plugins: (loader) => [
										require("postcss-import")({ root: loader.resourcePath }),
										require("autoprefixer"),
									],
								},
							},
							"less-loader",
						],
					}),
				},
				{
					test: /\.(css|less)$/,
					exclude: path.resolve(__dirname, "../src"),
					use: [
						{
							loader: "style-loader",
							options: {
								injectType: "linkTag",
							},
						},

						{
							loader: "file-loader",
							options: {
								name: "css/[name].css",
							},
						},
					],
				},
				{
					test: /\.(woff|woff2|eot|ttf|otf)$/, // 字体图标
					use: ["file-loader"],
				},
				{
					test: /\.(jpg|png|svg|gif)$/,
					use: [
						{
							loader: "url-loader",
							options: {
								limit: 10240,
								name: "images/[hash].[ext]",
								publicPath: "/",
							},
						},
					],
				},
			],
		},
		optimization: {
			splitChunks: {
				chunks: "all",
				minSize: 50000,
				minChunks: 1,
			},
		},
		resolve: {
			extensions: [".js", ".jsx", ".json"],
			alias: {
				"@": path.resolve(__dirname, '../src')
			}
		}
	};
}
module.exports = webpackCommonConfigCreator;
