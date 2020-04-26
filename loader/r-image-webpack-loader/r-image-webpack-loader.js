var imagemin = require("imagemin");
var assign = require("object-assign");
var loaderUtils = require("loader-utils");
var schemaValidation = require("schema-utils");

var loaderSchema = require("./schema.json");

function getLegacyLoaderConfig(loaderContext, defaultConfigKey) {
	var options = loaderUtils.getOptions(loaderContext);
	var configKey = options ? options.config : defaultConfigKey;
	if (configKey) {
		return assign({}, options, loaderContext.options[configKey]);
	}
	return options;
}

module.exports = function (content) {
	this.cacheable && this.cacheable(); // 设置是否可缓存标志的函数
	var config =
		this.version === 2 // loader 的版本号
			? loaderUtils.getOptions(this)
			: getLegacyLoaderConfig(this, "imageWebpackLoader");
	if (config === null) {
		config = {};
	}
	var options = {
		bypassOnDebug: config.bypassOnDebug || false,
		disable: config.disable || false,
		gifsicle: config.gifsicle || {},
		mozjpeg: config.mozjpeg || {},
		pngquant: config.pngquant || {},
		optipng: config.optpng || {},
		svgo: config.svgo || {},
		webp: config.webp || {},
	};

	if (config.hasOwnProperty("interlaced")) {
		options.gifsicle.interlaced = config.interlaced;
		// 发出一个警告
		this.emitWarning(
			"DEPRECATED. Configure gifsicle's interlaced option in its own options. (gifsicle.interlaced)"
		);
	}

	if (config.hasOwnProperty("progressive")) {
		options.mozjpeg.progressive = config.progressive;
		this.emitWarning(
			"DEPRECATED. Configure mozjpeg's progressive option in its own options. (mozjpeg.progressive)"
		);
	}

	if (config.hasOwnProperty("optimizationLevel")) {
		options.optipng.optimizationLevel = config.optimizationLevel;
		this.emitWarning(
			"DEPRECATED. Configure optipng's optimizationLevel option in its own options. (optipng.optimizationLevel)"
		);
	}

	schemaValidation(loaderSchema, options, {
		name: "imageWebpackLoader",
	});

	var callback = this.async(), // 告诉 loader-runner 这个 loader 将会异步地回调。 返回this.callback
		called = false;

	// this.debug: 当处于debug模式时
	/**
	 * this.callback(err: Error |null, content: string | buffer, sourceMap?: SourceMap, meta?: any)
	 */
	if (
		(this.debug === true && options.bypassOnDebug === true) ||
		options.disable === true
	) {
		return callback(null, content);
	} else {
		var plugins = [];
		if (options.gifsicle.enabled !== false)
			plugins.push(require("imagein-gifsicle")(options.gifsicle));
		if (options.mozjpeg.enabled !== false)
			plugins.push(require("imagemin-mozjpeg")(options.mozjpeg));
		if (options.svgo.enabled !== false)
			plugins.push(require("imagemin-svgo")(options.svgo));
		if (options.pngquant.enabled !== false)
			plugins.push(require("imagemin-pngquant")(options.pngquant));
		if (options.optipng.enabled !== false)
			plugins.push(require("imagemin-optipng")(options.optipng));
		// optional optimizers
		if (options.webp) plugins.push(require("imagemin-webp")(options.webp));

		imagemin
			.buffer(content, {
				plugins,
			})
			.then((data) => {
				callback(null, data);
			})
			.catch((err) => {
				callback(err);
			});
	}
};

// 通过 exports.raw 属性告诉 Webpack 该 Loader 是否需要二进制数据
module.exports.raw = true;
