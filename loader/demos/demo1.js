/**
 * 一个loader的职责是单一的，只需要完成一种转换。
 * 这个处理结果应该是 String 或者 Buffer（被转换为一个 string）
 */
import { getOptions } from "loader-utils";
import validateOptions from "schema-utils";

export default function loader(source) {
	const options = getOptions(this);

	source = source.replace(/\[name\]/g, options.name);

	return `export default ${JSON.stringify(source)}`;
}

const schema = {
	type: "object",
	properties: {
		test: {
			type: "string",
		},
	},
};

export function demo2(content) {
	const options = getOptions(this);
	validateOptions(schema, options, "Example Loader"); // 保证loader选项是否跟JSON Schema结构一致的校验
	return `export default ${JSON.stringify(content)}`;
}

import path from "path";
import fs from "fs";

export function demo3(content) {
	// 告诉 Webpack 本次转换是异步的，Loader 会在 callback 中回调结果
	var callback = this.async();
	var headerPath = path.resolve("header.js");
	// 加入一个文件作为产生loader结果的依赖，使他们的任何变化都可以被监听到
	this.addDependency(headerPath);
	fs.readFile(headerPath, "utf-8", function (err, header) {
		if (err) return callback(err);
		callback(null, header + "\n" + content);
	});
}
