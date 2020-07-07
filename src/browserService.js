const browserCode = require('./browser');
const puppeteer = require('puppeteer');
const LanguageMapping = require('./languages');
const Utils = require('./utils');
const waitOptions = { waitUntil: 'networkidle0' };

let browserInstance;

const closeBrowser = async () => {
    if (browserInstance) {
        await browserInstance.close();
    }
}
['SIGINT', 'SIGTERM'].forEach(function (sig) {
    process.on(sig, async () => {
        closeBrowser();
    });
});

async function launchBrowser(launchOptions) {
    return await puppeteer.launch({
        headless: launchOptions.headless !== false,
        args: launchOptions.args,
    });
}

module.exports.close = closeBrowser;

let page;

module.exports.translate = async function (launchOptions, words, language, translationId, TranslationContainer, duplicateKeys) {

    if (!browserInstance) {
        browserInstance = await launchBrowser(launchOptions);
    }
    if (!page) {
        page = await browserInstance.newPage();
        await page.setViewport({
            width: 1680,
            height: 947,
            deviceScaleFactor: 1,
        });
    }

    if (!TranslationContainer[language]) {
        TranslationContainer[language] = {};
    }

    if (!TranslationContainer['zh']) {
        TranslationContainer['zh'] = {};
    }
    try {
        const transformdWords = words ? words.replace(/\%/g, '') : '';
        await page.goto(`https://fanyi.baidu.com/#zh/${language}/${decodeURIComponent(transformdWords)}`, waitOptions);
        await page.reload();
        await page.waitForFunction(selector => !!document.querySelector(selector), {}, 'p.ordinary-output.target-output');
        const datas = await page.evaluate(browserCode, translationId);

        const validId = Utils.getUniqueId(datas.id, words, TranslationContainer['zh'], duplicateKeys);

        TranslationContainer[language][validId] = datas.translation;
        TranslationContainer['zh'][validId] = words;

        return validId;
    } catch (e) {
        console.error(e);
        TranslationContainer[language][words] = words;
        TranslationContainer['zh'][words] = words;
        console.log(`翻译【${words}】至语言【${LanguageMapping[language]}】失败：`, e);
        return null;
    }
}