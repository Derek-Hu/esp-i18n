const fs = require('fs');
const path = require('path');
const Utils = require('./utils');
const settings = require('./settings');
const paramParser = require('./param');
const browserInstance = require('./browserInstance');
const ProgressBar = require('progress');
const ast = require('./ast');
const translate = require('./translate');

const {asyncForEach} = Utils;

module.exports = async (params) => {

    const options = paramParser(params);
    const babelConfig = settings.babelConfig(options.isFlow);

    const fileNeedProcessing = Utils.getProcessFiles(options.folders, options.excludes);

    let fileIdx = 0;
    const progressBar = new ProgressBar(`国际化 :fileIdx/${fileNeedProcessing.length}个文件 [:bar] :percent 耗时:elapsed秒 :msg`, {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: fileNeedProcessing.length * 2 + 1,
    });
    await asyncForEach(fileNeedProcessing, async file => {
        fileIdx++;
        progressBar.tick({ fileIdx: fileIdx, msg: `正在处理文件：${path.relative(process.cwd(), file)}` });

        const isVueFile = /\.vue$/.test(file);
        const fileContent = fs.readFileSync(file, 'UTF8');
        const [jsContent, wrapper, placeholder] = isVueFile ? await options.getVueSource(file, fileContent, TranslationContainer) : [fileContent, null];
        let source = jsContent;

        try {
            const { entries, finalFuncName } = ast(source, babelConfig, options);

            if (!entries.length) {
                progressBar.tick({ fileIdx });
                return;
            }

            await asyncForEach(entries, async entry => {
                if(Utils.isIdEmpty(entry.value)){
                    source = source.slice(0, entry.start) + entry.getReplacement(null, finalFuncName) + source.slice(entry.end);
                    return;
                }
                const id = await translate(entry.value, options);
                const isSucess = !Utils.isIdEmpty(id);

                if (isSucess) {
                    source = source.slice(0, entry.start) + entry.getReplacement(id, finalFuncName) + source.slice(entry.end);
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
        progressBar.tick({ fileIdx, msg: `处理文件完成：${path.relative(process.cwd(), file)}` });
    });
    progressBar.tick({ fileIdx, msg: '' });
    browserInstance.close();
}