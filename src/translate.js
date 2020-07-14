const Utils = require('./utils');
const browserCode = require('./browser');
const browserInstance = require('./browserInstance');
const LanguageMapping = require('./languages');

const { asyncForEach } = Utils;
const waitOptions = { waitUntil: 'networkidle0' };

module.exports = (options) => {

    let TranslationContainer;
    let chinaValueKeyMapping;
    let duplicateKeys = {};
    let launchParams;

    const remoteTranslate = async function (words, language, translationId, fromLanguage = 'zh') {

        const page = await browserInstance.getPage(launchParams);
        try {
            const transformdWords = words ? words.replace(/\%/g, '') : '';
            await page.goto(`https://fanyi.baidu.com/#${fromLanguage}/${language}/${decodeURIComponent(transformdWords)}`, waitOptions);
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

    const translate = async (value) => {
        const { launchOptions, translateLanguages } = options;

        launchParams = launchOptions;

        if (!TranslationContainer) {
            TranslationContainer = Utils.loadLocales(translateLanguages, options.target);

            debugger;
            // 同步各Locale文件Id
            // 1. 先各文件同步给中文zh.js
            // 2. 然后zh.js同步给各locale
            await asyncForEach(translateLanguages, async code => {
                if(code === 'zh'){
                    return;
                }
                const codeKeys = Object.keys(TranslationContainer[code]);
                
                await asyncForEach(codeKeys, async codeKey => {
                    if (!(codeKey in TranslationContainer['zh'])) {
                        await remoteTranslate(TranslationContainer[code][codeKey], 'zh', codeKey, code);
                    }
                });
            });
            
            const zhKeys = Object.keys(TranslationContainer['zh']);

            await asyncForEach(translateLanguages, async code => {
                if(code === 'zh'){
                    return;
                }
                await asyncForEach(zhKeys, async zhKey => {
                    if (!(zhKey in TranslationContainer[code])) {
                        await remoteTranslate(TranslationContainer['zh'][zhKey], code, zhKey);
                    }
                });
            });

            chinaValueKeyMapping = zhKeys.reduce((all, chinaId) => {
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
            const cacheId = chinaValueKeyMapping[value];
            // await asyncForEach(translateLanguages, async code => {
            //     if (code !== 'zh' && !(cacheId in TranslationContainer[code])) {
            //         await remoteTranslate(value, code, cacheId);
            //     }
            // });
            return cacheId;
        } else {
            const id = await remoteTranslate(value, 'en', null);
            if (Utils.isIdEmpty(id)) {
                return null;
            }
            chinaValueKeyMapping[value] = id;

            await asyncForEach(translateLanguages, async code => {
                if (code !== 'en' && code !== 'zh') {
                    await remoteTranslate(value, code, id);
                }
            });
            return id;
        }
    }

    translate.getLocales = () => {
        return TranslationContainer;
    };
    return translate;

}
