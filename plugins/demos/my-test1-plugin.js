// 创建创建有以下组成
/**
 * 1、一个javascript命名函数。
 * 2、在插件函数的prototype上定义一个apply方法。
 * 3、指定一个绑定到webpack自身的事件钩子。
 * 4、处理webpack内部实例的特定数据。
 * 5、功能完成后调用webpack提供的回调。
 */

// 1、一个javascript命名函数。
function MyExampleWebpackPlugin() {}

// 2、在插件函数的prototype上定义一个`apply`方法。
MyExampleWebpackPlugin.prototype.applay = function (compiler) {
	// 3、指定一个绑定到webpack自身的事件钩子。
	// entryOption 配置项处理过之后，执行插件
	compiler.plugin("entryOption", function (
		compilation /* 4、处理webpack内部实例的特定数据。*/,
		callback
	) {
		console.log("This is an example plugin!!!");
		// 5、功能完成后调用webpack提供的回调。
		callback();
	});
};
