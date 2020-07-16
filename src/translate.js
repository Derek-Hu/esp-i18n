const Utils = require('./utils');
const browserCode = require('./browser');
const browserInstance = require('./browserInstance');
const LanguageMapping = require('./languages');

const { asyncForEach } = Utils;
const waitOptions = { waitUntil: 'networkidle0' };

module.exports = (options) => {

    let TranslationContainer;
    let duplicateKeys = {};
    let launchParams;

    const getTranslation = async function (words, language, fromLanguage = 'zh', translationId) {
        const page = await browserInstance.getPage(launchParams);
        try {
            const transformdWords = words ? words.replace(/\%/g, '') : '';
            await page.goto(`https://fanyi.baidu.com/#${fromLanguage}/${language}/${decodeURIComponent(transformdWords)}`, waitOptions);
            await page.reload();
            await page.waitForFunction(selector => !!document.querySelector(selector), {}, 'p.ordinary-output.target-output');
            return datas = await page.evaluate(browserCode, translationId);
        } catch (e) {
            console.error(`翻译【${words}】至语言【${LanguageMapping[language]}】失败：`, e);
            return {};
        }
    };

    const remoteTranslate = async function (value, language, fixedId, fromLanguage = 'zh') {
        const locales = TranslationContainer[fromLanguage];
        const toLocales = TranslationContainer[language];
        const zhLocales = TranslationContainer['zh'];

        const trimedValue = value.trim();

        const keys = Object.keys(locales);
        const fullId = keys.find(key => locales[key] === value);
        const trimedId = keys.find(key => locales[key] === trimedValue);
        const trimedsEqualId = keys.find(key => {
            return !Utils.isIdEmpty(locales[key]) ? `${locales[key]}`.trim() === trimedValue : false;
        });

        const idTranslationMap = {
            id: Utils.isIdEmpty(fullId) ? null : toLocales[fullId],
            trim: Utils.isIdEmpty(trimedId) ? null : toLocales[trimedId],
            equal: Utils.isIdEmpty(trimedsEqualId) ? null : toLocales[trimedsEqualId],
        };
        const selectedType = Object.keys(idTranslationMap).find(type => {
            return !Utils.isIdEmpty(idTranslationMap[type]);
        });
        // const selectedType = !Utils.isIdEmpty(idTranslationMap.id) ? 'id' : (!Utils.isIdEmpty(idTranslationMap.trim) ? 'trim' : (!Utils.isIdEmpty(idTranslationMap.equal) ? 'equal' : null));

        let finalTranslation = null;
        let browserId = null;

        if (selectedType === 'id') {
            finalTranslation = idTranslationMap[selectedType];
        }else {
            const placeholder = '__';
            const template = value.replace(trimedValue, placeholder);

            let trimedTranslation = null;

            if (!selectedType) {
                const { id, translation } = await getTranslation(trimedValue, language, fromLanguage);
                if (!Utils.isIdEmpty(translation)) {
                    browserId = id;
                    trimedTranslation = translation;
                }
            } else {
                if (selectedType === 'equal') {
                    trimedTranslation = `${idTranslationMap[selectedType]}`.trim();
                }else{
                    trimedTranslation = idTranslationMap[selectedType];
                } 
            }
            finalTranslation = template.replace(placeholder, trimedTranslation);
        }

        if (Utils.isIdEmpty(finalTranslation)) {
            return {};
        }

        const chinaWord = language === 'zh' ? finalTranslation : value;
        let finalId = null;
        if (!Utils.isIdEmpty(fixedId)) {
            finalId = fixedId;
        } else if (selectedType) {
            if (selectedType === 'id') {
                finalId = fullId;
            } else {
                finalId = Utils.getUniqueId(trimedId || trimedsEqualId, chinaWord, zhLocales, duplicateKeys);
            }
        } else {
            if (!Utils.isIdEmpty(browserId)) {
                finalId = Utils.getUniqueId(browserId, chinaWord, zhLocales, duplicateKeys);;
            }
        }

        return {
            id: finalId,
            translation: finalTranslation,
        }

    }

    const translate = async (value) => {
        const { launchOptions, translateLanguages } = options;

        const sortted = translateLanguages.sort((a) => { if (a === 'en') { return -1 } return 1 }).filter(code => code !== 'zh');

        launchParams = launchOptions;

        if (!TranslationContainer) {
            TranslationContainer = Utils.loadLocales(translateLanguages, options.target);

            debugger;
            // 同步各Locale文件Id
            // 1. 先各文件同步给中文zh.js
            // 2. 然后zh.js同步给各locale
            await asyncForEach(sortted, async code => {
                const codeKeys = Object.keys(TranslationContainer[code]);

                await asyncForEach(codeKeys, async codeKey => {
                    if (!(codeKey in TranslationContainer['zh'])) {
                        const { translation } = await remoteTranslate(TranslationContainer[code][codeKey], 'zh', codeKey, code);
                        if (!Utils.isIdEmpty(translation)) {
                            TranslationContainer['zh'][codeKey] = translation;
                        }
                    }
                });
            });

            const zhKeys = Object.keys(TranslationContainer['zh']);

            await asyncForEach(sortted, async code => {
                await asyncForEach(zhKeys, async zhKey => {
                    if (!(zhKey in TranslationContainer[code])) {
                        const { translation } = await remoteTranslate(TranslationContainer['zh'][zhKey], code, zhKey);
                        if (!Utils.isIdEmpty(translation)) {
                            TranslationContainer[code][zhKey] = translation;
                        }
                    }
                });
            });

            duplicateKeys = {};

        }
        if (Utils.isIdEmpty(value)) {
            return value;
        }

        let fixedId = null;
        await asyncForEach(sortted, async code => {
            const { id, translation } = await remoteTranslate(value, code, fixedId);
            if (Utils.isIdEmpty(id) || Utils.isIdEmpty(translation)) {
                return null;
            }
            if (code === 'en') {
                fixedId = id;
                TranslationContainer['zh'][fixedId] = value;
            }
            TranslationContainer[code][fixedId] = translation;
        });
        return fixedId;
    }

    translate.getLocales = () => {
        return TranslationContainer;
    };
    return translate;

}
