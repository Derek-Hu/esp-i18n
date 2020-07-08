const fs = require('fs');
const path = require('path');
const Utils = require('./utils');
const settings = require('./settings');
const paramParser = require('./param');
const browserService = require('./browserService');
const ProgressBar = require('progress');
const ast = require('./ast');
const translation = browserService.translate;

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports = async (params) => {

    const options = paramParser(params);
    const { launchOptions, translateLanguages } = options;
    const babelConfig = settings.babelConfig(options.isFlow);

    const TranslationContainer = Utils.loadLocales(translateLanguages, options.target);

    const chinaValueKeyMapping = Object.keys(TranslationContainer['zh']).reduce((all, chinaId) => {
        all[TranslationContainer['zh'][chinaId]] = chinaId;
        return all;
    }, {});

    const duplicateKeys = {};

    async function getId(value) {
        const id = await translation(launchOptions, value, 'en', null, TranslationContainer, duplicateKeys);
        if (Utils.isIdEmpty(id)) {
            return null;
        }
        chinaValueKeyMapping[value] = id;

        await asyncForEach(translateLanguages, async code => {
            if (code !== 'en' && code !== 'zh') {
                await translation(launchOptions, value, code, id, TranslationContainer, duplicateKeys);
            }
        });
        return id;
    }

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
        // console.log('file', file);
        progressBar.tick({
            fileIdx: fileIdx,
            msg: `正在处理文件：${path.relative(process.cwd(), file)}`,
        });
        const fileContent = fs.readFileSync(file, 'UTF8');

        const [jsContent, wrapper, placeholder] = options.getSource ? await options.getSource(file, fileContent) : [fileContent, null];

        let source = jsContent;
        try {
            const { entries, finalFuncName } = ast(source, babelConfig, options);

            if (!entries.length) {
                progressBar.tick({
                    fileIdx,
                    // msg: `处理文件完成：${path.relative(process.cwd(), file)}`,
                });
                // console.log('file', file);
                return;
            }

            await asyncForEach(entries, async entry => {
                let id = null;
                if (entry.value) {
                    entry.value = entry.value.trim();
                    if (chinaValueKeyMapping[entry.value] !== undefined) {
                        id = chinaValueKeyMapping[entry.value];
                    } else {
                        id = await getId(entry.value);
                    }
                }

                const isSucess = !Utils.isIdEmpty(id) && entry.value;
                if (isSucess || !entry.value) {
                    source = source.slice(0, entry.start) + entry.getReplacement(id, finalFuncName) + source.slice(entry.end);
                }
            });

            source = wrapper && placeholder ? wrapper.replace(placeholder, source) : source;

            Object.keys(TranslationContainer).forEach(language => {
                Utils.writeSync(path.resolve(options.target, `${language}.js`), `${settings.Header}${JSON.stringify(TranslationContainer[language], null, 2)}`);
            });
            Utils.writeSync(path.resolve(options.srcTarget, path.relative(options.baseFolder, file)), source);
        } catch (e) {
            console.error(`解析文件失败：${file}`, e);
            console.log(jsContent);
        }
        progressBar.tick({
            fileIdx,
            msg: `处理文件完成：${path.relative(process.cwd(), file)}`,
        });
    });
    progressBar.tick({
        fileIdx,
        msg: '',
    });
    browserService.close();
}