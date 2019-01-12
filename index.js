#!/usr/bin/env node
//文章参考http://blog.gdfengshuo.com/article/27/
const program = require('commander');//处理命令行
const download = require('download-git-repo');//下载模板
const inquirer = require('inquirer');//命令行交互
const fs = require('fs');
const ora = require('ora');//使用 ora 来提示用户正在下载中
const chalk = require('chalk');//通过 chalk 来为打印信息加上样式，比如成功信息为绿色，失败信息为红色，这样子会让用户更加容易分辨，同时也让终端的显示更加的好看
const symbols = require('log-symbols');//使用 log-symbols 在信息前面加上 √ 或 × 等的图标
const handlebars = require("handlebars");
//direct:https://gitee.com/winglau/ES6toES5_WebSite.git
const downLoadUrl = 'direct:';

program.version('1.0.0', '-v, --version')
    .command('init <name>')
    .action((name) => {
        //console.log(name);
        if (!fs.existsSync(name)) {
            inquirer.prompt([
                {
                    name: 'description',
                    message: '请输入项目描述'
                },
                {
                    name: 'author',
                    message: '请输入作者名称'
                },
                {
                    name: 'cloneUrl',
                    message: '请输入需要clone git url or 使用默认下载地址'
                },
            ]).then((answers) => {
                //console.log(answers);
                const spinner = ora('正在下载模板...');
                spinner.start();
                //下载代码库
                download(`${downLoadUrl}${answers.cloneUrl ? answers.cloneUrl : 'https://gitee.com/winglau/ES6toES5_WebSite.git'}`, name, {clone: true}, (err) => {
                    //下载失败
                    if (err) {
                        spinner.fail();
                        console.log(symbols.error, chalk.red(err));
                    } else {
                        //开始下载
                        const meta = {
                            name,
                            description: answers.description,
                            author: answers.author
                        };
                        const fileName = `${name}/package.json`;
                        if (fs.existsSync(fileName)) {
                            const content = fs.readFileSync(fileName).toString();
                            const result = handlebars.compile(content)(meta);
                            fs.writeFileSync(fileName, result);
                            spinner.succeed(chalk.green('项目初始化完成'));
                            console.log(chalk.white(`To get started:\n`));
                            console.log(chalk.yellow(` (1)cd ${name}\n (2)先执行:npm install or yarn install 安装项目依赖\n (3)dev:npm run dev or yarn run dev\n (4)build:npm run build or yarn run build\n (5)项目上线前文件压缩打包,测试环境:gulp tsRun,正式环境:gulp offRun`)
                            );
                            spinner.stop();
                        }
                        //console.log(symbols.success, chalk.green('项目初始化完成'));
                    }
                })
            });
        } else {
            // 错误提示项目已存在，避免覆盖原有项目
            console.log(symbols.error, chalk.red('项目已存在,请重新新建项目名称'));
        }
    });
program.parse(process.argv);