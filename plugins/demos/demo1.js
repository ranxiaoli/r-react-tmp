class BasicPlugin {
	// 在构造函数中获取用户给改插件传入的配置
	constructor(options) {}

	applay(compiler) {
		compiler.plugin("compilation", function (compilation) {});
	}
}
// 导出 Plugin
module.exports = BasicPlugin;

////////////////////////////////////////////////

function HelloWorldPlugin(options) {}

HelloWorldPlugin.prototype.apply = function (compiler) {
	// done 编译(compilation)完成。
	compiler.plugin("done", function () {
		console.log("Hello World!");
	});
};

module.exports = HelloWorldPlugin;

////////////////////////////////////////////////

function HelloCompilationPlugin(options) {}

HelloCompilationPlugin.prototype.apply = function (compiler) {
	// 设置回调来访问 compilation 对象： 编译(compilation)创建之后，执行插件。
	compiler.plugin("compilation", function (compilation) {
		// 现在，设置回调来访问 compilation 中的步骤： optimize: 优化阶段开始时触发。
		compilation.plugin("optimize", function () {
			console.log("Assets are being optimized.");
		});
	});
};

module.exports = HelloCompilationPlugin;

////////////////////////////////////////////////

function HelloAsyncPlugin(options) {}

HelloAsyncPlugin.prototype.applay = function (compiler) {
	// emit钩子： 生成资源到 output 目录之前。
	compiler.plugin("emit", function (compilation, callback) {
		setTimeout(function () {
			console.log("异步编译插件：Done with async work...   ");
			callback();
		});
	});
};

module.exports = HelloAsyncPlugin;

/////////////////////////////////////////////////

function FileListPlugin(options) {}

FileListPlugin.prototype.apply = function (compiler) {
	// emit钩子 生成资源到 output 目录之前。
	compiler.plugin("emit", function (compilation, callback) {
		// 在生成文件中，创建一个头部字符串：
		var filelist = "In this build: \n\n";
		// 遍历所有编译过的资源文件，
		// 对于每个文件名称，都添加一行内容。
		for (var filename in compilation.assets) {
			filelist += "- " + filename + "\n";
		}
		compilation.assets["filelist.md"] = {
			source: function () {
				return filelist;
			},
			size: function () {
				return filelist.length;
			},
		};

		callback();
	});
};

module.exports = FileListPlugin;

//////////////////////////////////////////
/**
 * webpack的事件流机制应用了观察者模式，和Node.js的EventEmitter非常相似。compiler和compilation都集成自Tapable,
 * 可以直接在compiler和compilation对象上广播和监听事件
 */

/**
 * 广播事件
 * event-name 为事件名，注意不要和现有的事件重名
 * params 为附带的参数
 */
compiler.apply("event-name", params);

/**
 * 监听名称为event-name的事件， 当event-name事件发生时，函数就会被执行。
 * 同时函数中的params参数为广播事件时附带的参数
 * 同理，compilation.apply和compilation.plugin使用方法和上面一致。
 */
compiler.plugin("event-name", function (params) {});

//////////////////////////////////////////////////////////////

// 读取输出资源、代码块、模块及其依赖
// emit 事件 ： 代表源文件的转换和组装已经完成，在这里可以读取到最终将输出的资源、代码块、模块及其依赖，并且可以修改输出资源的内容
class Plugin {
	apply(compiler) {
		// 读取输出资源、代码块、模块及其依赖
		compiler.plugin("emit", function (compilation, callback) {
			// compilation.chunks存放所有代码块，是一个数组
			compilation.chunks.forEach(function (chunk) {
				// chunk代表一个代码块
				// 代码块由多个模块组成，通过chunk.forEachModule能读取组成代码的每个模块
				chunk.forEachModule(function (module) {
					// module 代表一个模块
					// module.fileDependencies 存放当前模块的所有依赖的文件路径， 是一个数组
					module.fileDependencies.forEach(function (filepath) {});
				});

				// webpack 会根据chunk去生成输出的文件资源， 每个chunk都对应一个及其以上的输出文件
				// 例如在chunk中包含了css模块并且使用了ExtractTextPlugin时，
				// 该chunk就会生成.js和.css两个文件
				chunk.files.forEach(function (filename) {
					// compilation.assets 存放当前所有即将输出的资源
					// 调用一个输出资源的source()方法能获取到输出的内容
					let source = compilation.assets[filename].source();
				});
			});

			// 这是一个异步事件，要记得调用 callback 通知 Webpack 本次事件监听处理结束。
			// 如果忘记了调用 callback，Webpack 将一直卡在这里而不会往后执行。
			callback();
		});

		/**
		 * 监听文件变化
		 * */
		// 当依赖的文件发生变化时会触发 watch-run 事件
		// watchRun 监听模式下，一个新的编译(compilation)触发之后，执行一个插件，但是是在实际编译开始之前。
		compiler.plugin("watch-run", (watching, callback) => {
			// 获取发生变化的文件列表
			const changedFiles = watching.compiler.watchFileSystem.watcher.mtimes;
			// changedFiles 格式为键值对，键为发生变化的文件路径。
			if (changedFiles[filePath] !== undefined) {
				// filePath 对应的文件发生了变化
			}
			callback();
		});
		compiler.plugin("after-compile", (compilation, callback) => {
			// 把 HTML 文件添加到文件依赖列表，好让 Webpack 去监听 HTML 模块文件，在 HTML 模版文件发生变化时重新启动一次编译
			compilation.fileDependencies.push(filePath);
			callback();
		});

		/**
		 * 修改输出资源
		 */
		compiler.plugin("emit", (compilation, callback) => {
			// 设置名称为fileName的输出资源
			compilation.assets[fileName] = {
				source: () => {
					// fileContent 既可以是代表文本文件的字符串，也可以是代表二进制文件的 Buffer
					return fileContent;
				},
				size: () => {
					return Buffer.byteLength(fileContent, "utf8");
				},
			};
			callback();
		});

		compiler.plugin("emit", (compilation, callback) => {
			// 读取名称为 fileName 的输出资源
			const asset = compilation.assets[fileName];
			// 获取输出资源的内容
			asset.source();
			// 获取输出资源的文件大小
			asset.size();
			callback();
		});
	}
}

//////////////////////////////////////////////////////////////////////////////
/**
 * 判断当前配置是否使用了ExctractTextPlugin
 * compiler参数为webpack在apply(compiler)中传入的参数
 */
function hasExtractTextPlugin(compiler) {
	// 当前配置所有使用的插件列表
	const plugins = compiler.options.plugins;
	// 去 plugins 中寻找有没有 ExtractTextPlugin 的实例
	return (
		plugins.find(
			(plugin) => plugin.__proto__.constructor === ExtractTextPlugin
		) != null
	);
}

/////////////////////////////////////////////////////////////////////////////

// 监听观察图(watch graph)的修改
class MyPlugin {
	startTime = Date.now();
	prevTimestamps = {};
	apply(compiler) {
		compiler.plugin(
			"emit",
			function (compilation, callback) {
				const changedFiles = Object.keys(compilation.fileTimestamps).filter(
					function (watchfile) {
						return (
							(this.prevTimestamps[watchfile] || this.startTime) <
							(compilation.fileTimestamps[watchfile] || Infinity)
						);
					}.bind(this)
				);
				this.prevTimestamps = compilation.fileTimestamps;
				callback();
			}.bind(this)
		);
	}
}
module.exports = MyPlugin;

// 监听 chunk的修改
function MyPlugin1() {
	this.chunkVersions = {};
}

MyPlugin.prototype.apply = function (compiler) {
	compiler.plugin(
		"emit",
		function (compilation, callback) {
			var changedChunks = compilation.chunks.filter(
				function (chunk) {
					var oldVersion = this.chunkVersions[chunk.name];
					this.chunkVersions[chunk.name] = chunk.hash;
					return chunk.hash !== oldVersion;
				}.bind(this)
			);

			callback();
		}.bind(this)
	);
};

module.exports = MyPlugin1;
