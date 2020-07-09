const Utils = require('./utils');
const browserCode = require('./browser');
const browserInstance = require('./browserInstance');
const LanguageMapping = require('./languages');

let TranslationContainer;
let chinaValueKeyMapping;
let duplicateKeys = {};
let launchParams;

const { asyncForEach } = Utils;
const waitOptions = { waitUntil: 'networkidle0' };

let page;

const translate = async function (words, language, translationId) {

    if (!page) {
        page = await browserInstance.getPage(launchParams);
    }
    try {
        const transformdWords = words ? words.replace(/\%/g, '') : '';
        await page.goto(`https://fanyi.baidu.com/#zh/${language}/${decodeURIComponent(transformdWords)}`, waitOptions);
        await page.reload();
        await page.waitForFunction(selector => !!document.querySelector(selector), {}, 'p.ordinary-output.target-output');
        const datas = await page.evaluate(browserCode, translationId);

        const validId = Utils.getUniqueId(datas.id, words, TranslationContainer['zh'], duplicateKeys);

        TranslationContainer[language][validId] = datas.translation;

        return validId;
    } catch (e) {
        console.error(`翻译【${words}】至语言【${LanguageMapping[language]}】失败：`, e);
        return null;
    }
}

module.exports = async (value, options) => {

    const { launchOptions, translateLanguages } = options;

    launchParams = launchOptions;
    
    if (!TranslationContainer) {
        TranslationContainer = Utils.loadLocales(translateLanguages, options.target);
        
        chinaValueKeyMapping = Object.keys(TranslationContainer['zh']).reduce((all, chinaId) => {
            all[TranslationContainer['zh'][chinaId]] = chinaId;
            return all;
        }, {});
        
        duplicateKeys = {};
        
    }
    if (Utils.isIdEmpty(value)) {
        return value;
    }
    value = value.trim();
    if (chinaValueKeyMapping[value] !== undefined) {
        return chinaValueKeyMapping[value];
    } else {
        const id = await translate(value, 'en', null);
        if (Utils.isIdEmpty(id)) {
            return null;
        }
        chinaValueKeyMapping[value] = id;

        await asyncForEach(translateLanguages, async code => {
            if (code !== 'en' && code !== 'zh') {
                await translate(value, code, id);
            }
        });
        return id;
    }
}

module.exports.getLocales = () => {
    return TranslationContainer;
};
