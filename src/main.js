const fs = require('fs');
const path = require('path');
const Utils = require('./utils');
const settings = require('./settings');
const paramParser = require('./param');
const browserInstance = require('./browserInstance');
const ProgressBar = require('progress');
const ast = require('./ast');
const translateGenerator = require('./translate');
const vue = require('./vue');

const { asyncForEach } = Utils;

const getVueSource = async function (translate, path, content, errorVueFiles) {
    var contentOneLine = await vue(translate, path, content, errorVueFiles);
    const placeholder = '____VUE_PLACEHOLDER____';
    const scripts = '<script>\n' + placeholder + '</script>';
    const matchs = contentOneLine.match(/<script>((.*\n)*)<\/script>/);
    const validContent = matchs && matchs[1] ? matchs[1] : '';

    return [
        validContent,
        contentOneLine.replace(/<script>((.*\n)*)<\/script>/, scripts),
        placeholder
    ];
};

module.exports = async (params) => {

    const options = paramParser(params);

    const translate = translateGenerator(options);
    const errorVueFiles = [];
    const babelConfig = settings.babelConfig(options.isFlow);

    const fileNeedProcessing = Utils.getProcessFiles(options.folders, options.excludes);

    let fileIdx = 0;
    const progressBar = new ProgressBar(`国际化 :fileIdx/${fileNeedProcessing.length}个文件 [:bar] :percent 耗时:elapsed秒 :msg`, {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: fileNeedProcessing.length * 2 + 1,
    });
    const jsErrors = {};

    await asyncForEach(fileNeedProcessing, async file => {
        fileIdx++;
        const shortFile = path.relative(process.cwd(), file);
        progressBar.tick({ fileIdx: fileIdx, msg: `正在处理文件：${shortFile}` });

        const isVueFile = /\.vue$/.test(file);
        const fileContent = fs.readFileSync(file, 'UTF8');
        const [jsContent, wrapper, placeholder] = isVueFile ? await getVueSource(translate, file, fileContent, errorVueFiles) : [fileContent, null];
        let source = jsContent;

        try {
            const { entries, finalFuncName } = ast(source, babelConfig, options);

            if (!entries.length) {
                progressBar.tick({ fileIdx, msg: '' });
                return;
            }

            await asyncForEach(entries, async entry => {
                if (Utils.isIdEmpty(entry.value)) {
                    // Add [import from ''] Statement
                    source = source.slice(0, entry.start) + entry.getReplacement(null, finalFuncName) + source.slice(entry.end);
                    return;
                }
                const id = await translate(entry.value);
                const isSucess = !Utils.isIdEmpty(id);

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
                Utils.writeSync(path.resolve(options.target, `${language}.js`), `${settings.Header}${JSON.stringify(allLocales[language], null, 2)}`);
            });
            Utils.writeSync(path.resolve(options.srcTarget, path.relative(options.baseFolder, file)), source);
        } catch (e) {
            console.error(`解析文件失败：${file}`, e);
            console.log(jsContent);
        }
        progressBar.tick({ fileIdx, msg: `处理文件完成：${shortFile}` });
    });
    progressBar.tick({ fileIdx, msg: '' });
    
    if (errorVueFiles.length) {
        console.log();
        console.error('未能正确处理的Vue文件:');
        console.error(errorVueFiles.join('\n'));
        console.log();
    }

    if (Object.keys(jsErrors).length) {
        console.log();
        console.error('存在未翻译完全的JS文件，再次执行本命令将自动修复：');
        console.error(Object.keys(jsErrors).join('\n'));
        console.log();
    } else {
        const { translateLanguages } = options;
        const sizes = translateLanguages.map(language => {
            const source = fs.readFileSync(path.resolve(options.target, `${language}.js`), 'UTF8');
            return Object.keys(JSON.parse(source.replace(settings.Header, ''))).length;
        });
        const isAllKeysEquals = sizes.every((size) => {
            return size === sizes[0];
        });
        if (!isAllKeysEquals) {
            console.log();
            console.error('中文翻译至其他语言时异常，再次执行本命令将自动修复。');
            console.log();
        }
    }
    await browserInstance.close();
}