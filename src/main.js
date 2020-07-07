const fs = require('fs');
const path = require('path');
const Utils = require('./utils');
const Constant = require('./constant');
const loadLocales = require('./load');
const BabelOption = require('./babel');
const paramParser = require('./param');
const browserService = require('./browserService');
const ProgressBar = require('progress');
const ast = require('./ast');

const translation = browserService.translate;

module.exports = async (params) => {

    const options = paramParser(params);
    const {launchOptions, translateLanguages} = options;
    const babelConfig = BabelOption(options.isFlow);

    const TranslationContainer = loadLocales(translateLanguages, options.target);

    console.log('TranslationContainer', TranslationContainer);

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

        for (code of translateLanguages) {
            if (code === 'en' || code === 'zh') {
                return;
            }
            await translation(launchOptions, value, code, id, TranslationContainer, duplicateKeys);
        }
        return id;
    }

    const fileNeedProcessing = Utils.getProcessFiles(options.folders, options.excludes);

    const progressBar = new ProgressBar('国际化:current/:total个文件 [:bar] :percent 耗时:elapsed秒 正在处理文件：:file', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: fileNeedProcessing.length,
    });
    for (file of fileNeedProcessing) {
        progressBar.tick({
            file: file,
        });
        const fileContent = fs.readFileSync(file, 'UTF8');

        const [jsContent, wrapper, placeholder] = options.getSource ? await options.getSource(file, fileContent) : [fileContent, null];

        let source = jsContent;

        try {
            const { entries, finalFuncName } = ast(source, babelConfig, options);

            if (!entries.length) {
                return;
            }

            for (entry of entries) {
                let id = null;
                if (entry.value) {
                    entry.value = entry.value.trim();
                    if (chinaValueKeyMapping[entry.value] !== undefined) {
                        id = chinaValueKeyMapping[entry.value];
                    } else {
                        id = await getId(entry.value);
                    }
                }
                if(id!==null){
                    source = source.slice(0, entry.start) + n.getReplacement(id, finalFuncName) + source.slice(entry.end);
                }
            }

            source = wrapper && placeholder ? wrapper.replace(placeholder, source) : source;

            Object.keys(TranslationContainer).forEach(language => {
                // if (!options.hasEnglish && language === 'en') {
                //     return;
                // }
                Utils.writeSync(path.resolve(options.target, `${language}.js`), `${Constant.Header}${JSON.stringify(TranslationContainer[language], null, 2)}`);
            });
            Utils.writeSync(path.resolve(options.srcTarget, path.relative(options.baseFolder, file)), source);
        } catch (e) {
            console.error(`解析文件失败：${file}`, e);
            console.log(jsContent);
        }
    };
    browserService.close();
}