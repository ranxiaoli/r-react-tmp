#!/usr/bin/env node

const { program } = require("commander");
const path = require("path");
const fs = require("fs");
const inquirer = require("inquirer");
const ora = require("ora");
const download = require("download-git-repo");
const Handlebars = require("handlebars");
const chalk = require("chalk");

const {
	projectSuccess,
	noPackageJSON,
	pullFailed,
	queryError,
	info,
} = require("./utils/outputFunc");
const { queryArr } = require("./utils/inquirerArr");
const { runInstall } = require("./utils/npmInstall");

const version = "1.2.3";
program
	.command("info")
	.description("描述包")
	.action(() => {
		info();
	});

program
	.version(version)
	.command("init <name>")
	.description("初始化项模板")
	.action((projectName) => {
		const targetPath = path.resolve(process.cwd(), projectName);
		if (fs.existsSync(targetPath)) {
			console.log("当前文件名已存在! 请重新输入!");
			return;
		}
		inquirer
			.prompt(queryArr)
			.then((paramater) => {
				const spinner = ora("模板下载中^.^ 请稍后");
				spinner.start();
				paramater = { ...paramater, version };
				download(
					"https://github.com/ranxiaoli/r-react-cli.git",
					targetPath,
					{ clone: true },
					(err) => {
						if (!err) {
							spinner.succeed();
							const packagePath = path.join(targetPath, "package.json");
							if (fs.existsSync(packagePath)) {
								const content = fs.readFileSync(packagePath).toString();
								const template = Handlebars.compile(content);
								const result = template(paramater);
								fs.writeFileSync(packagePath, result);
							} else {
								spinner.fail();
								noPackageJSON();
								return;
							}
							console.log(chalk.green("success！ 项目初始化成功") + "\n");
							runInstall(targetPath, () => projectSuccess(projectName));
						} else {
							pullFailed();
							return;
						}
					}
				);
			})
			.catch((err) => {
				queryError(err);
				return;
			});
	});

program.parse(process.argv); // 解析变量
