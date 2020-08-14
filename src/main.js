const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const Utils = require('./utils');
const settings = require('./settings');
const paramParser = require('./param');
const browserInstance = require('./browserInstance');
const ProgressBar = require('progress');
const ast = require('./ast');
const translateGenerator = require('./translate');
const vue = require('./vue');

const { asyncForEach } = Utils;

module.exports = async (params) => {

    const options = paramParser(params);
    const { idName } = options;

    const translate = translateGenerator(options);
    const errorVueFiles = [];
    const suspectVueFiles = [];
    const halfVueFiles = [];
    const babelConfig = settings.babelConfig(options.isFlow);

    const fileNeedProcessing = Utils.getProcessFiles(options.folders, options.excludes);

    let fileIdx = 0;
    const progressBar = new ProgressBar(`国际化 :fileIdx/${fileNeedProcessing.length}个文件 [:bar] :percent 耗时:elapsed秒 :msg`, {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: fileNeedProcessing.length + 1,
    });
    const jsErrors = {};

    await asyncForEach(fileNeedProcessing, async file => {
        fileIdx++;
        const shortFile = path.relative(process.cwd(), file);
        progressBar.tick({ fileIdx: fileIdx, msg: `正在处理文件：${shortFile}` });

        const shortPath = path.relative(process.cwd(), file);
        const isVueFile = /\.vue$/.test(file);
        const fileContent = fs.readFileSync(file, 'UTF8');
        const { scripts: jsContent, placeholder, wrapper } = isVueFile ? await vue(translate, file, fileContent, errorVueFiles, suspectVueFiles, idName) : { scripts: fileContent };
        let source = jsContent;

        let entries;
        let finalFuncName;
        let syntaxError = false;
        try {
            const astData = ast(source, babelConfig, options);
            if (astData) {
                entries = astData.entries;
                finalFuncName = astData.finalFuncName;
            }
        } catch (e) {
            syntaxError = true;
            if (!errorVueFiles.includes(shortPath)) {
                errorVueFiles.push(shortPath);
            }
            console.log();
            console.error(chalk.red(`解析文件失败：${file}`));
            console.error(chalk.red(jsContent));
        }

        if (!entries || !entries.length) {
            // Template有中文，JS中无中文，且JS代码AST正确解析
            if (!syntaxError && wrapper) {
                const newSource = wrapper.replace(placeholder, jsContent);
                const isUpdate = newSource !== fileContent;
                if (isUpdate) {
                    halfVueFiles.push(shortPath);
                    Utils.writeSync(path.resolve(options.srcTarget, path.relative(options.baseFolder, file)), newSource);
                }
            }
            return;
        }

        await asyncForEach(entries, async entry => {
            if (Utils.isEmpty(entry.value)) {
                // Add [import from ''] Statement
                source = source.slice(0, entry.start) + (isVueFile ? '\n' : '') + entry.getReplacement(null, finalFuncName) + source.slice(entry.end);
                return;
            }
            const id = await translate(entry.value);
            const isSucess = !Utils.isEmpty(id);

            if (isSucess) {
                source = source.slice(0, entry.start) + entry.getReplacement(id, finalFuncName) + source.slice(entry.end);
            } else {
                if (!jsErrors[shortFile]) {
                    jsErrors[shortFile] = {};
                }
                jsErrors[shortFile][entry.value] = true;
            }
        });

        source = wrapper && placeholder ? wrapper.replace(placeholder, source) : source;

        const allLocales = translate.getLocales();

        Object.keys(allLocales).forEach(language => {
            Utils.writeSync(path.resolve(options.target, `${language}.${options.tsExtension ? 'ts' : 'js'}`), `${settings.Header}${JSON.stringify(allLocales[language], null, 2)}`);
        });
        Utils.writeSync(path.resolve(options.srcTarget, path.relative(options.baseFolder, file)), source);

    });
    progressBar.tick({ fileIdx, msg: '' });

    const spaces = '  ';
    if (errorVueFiles.length) {
        console.log();
        console.error(chalk.red('以下文件存在语法错误，未能正确解析：'));
        console.error(chalk.red(`${spaces}${errorVueFiles.join(`\n${spaces}`)}`));
        console.log();
    }

    if (suspectVueFiles.length) {
        console.log();
        console.warn(chalk.yellow(`原文件中存在[${idName}]字符串，请检查并确认代码修改后，data函数中是否存在属性[${idName}]覆盖的情况。`));
        console.warn(chalk.yellow(`可能处理异常的Vue文件如下：`));
        console.warn(chalk.yellow(`${spaces}${suspectVueFiles.join(`\n${spaces}`)}`));
        console.log();
    }

    if (halfVueFiles.length) {
        console.log();
        console.error(chalk.red(`原文件中<template>中存在中文，文件已更新，请手动合并相关代码。`));
        console.error(chalk.red(`需手动解决冲突的Vue文件如下：`));
        console.error(chalk.red(`${spaces}${halfVueFiles.join(`\n${spaces}`)}`));
        console.log();
    }

    if (Object.keys(jsErrors).length) {
        console.log();
        console.warn(chalk.yellow('存在未翻译完全的JS文件，再次执行本命令将自动修复：'));
        console.warn(chalk.yellow(`${spaces}${Object.keys(jsErrors).join(`\n${spaces}`)}`));
        console.log();
    } else {
        const { translateLanguages } = options;
        const sizes = translateLanguages.map(language => {
            const localeJson = Utils.jsonCompatiable(path.resolve(options.target, `${language}.js`));
            // const source = fs.readFileSync(, 'UTF8');
            return Object.keys(localeJson).length;
        });
        const isAllKeysEquals = sizes.every((size) => {
            return size === sizes[0];
        });
        if (!isAllKeysEquals) {
            console.log();
            console.error(chalk.red('中文翻译至其他语言时异常，再次执行本命令将自动修复。'));
            console.log();
        }
    }
    await browserInstance.close();
}