const browserCode = require('./browser');
const puppeteer = require('puppeteer');
const LanguageMapping = require('./languages');

const waitOptions = { waitUntil: 'networkidle0' };

let page;
let browser;

['SIGINT', 'SIGTERM'].forEach(function (sig) {
    process.on(sig, async () => {
        if (browser) {
            await browser.close();
        }
    });
});

async function launchBrowser(launchOptions) {
    console.log('launchOptions', launchOptions);
    browser = await puppeteer.launch({
        headless: launchOptions.headless !== false,
        args: launchOptions.args,
    });
    console.log('open page');
    page = await browser.newPage();
    
    await page.setViewport({
        width: 1680,
        height: 947,
        deviceScaleFactor: 1,
    });
}

module.exports.getBrowserInstance = function () {
    return browser;
}

// module.exports.launchBrowser = launchBrowser;
module.exports.translate = async function (launchOptions, words, language, translationId, TranslationContainer, duplicateKeys) {

    if (!page) {
        await launchBrowser(launchOptions);
    }
    const transformdWords = words ? words.replace(/\%/g, '') : '';
    const selector = 'p.ordinary-output.target-output';
    try {
        await page.goto(`https://fanyi.baidu.com/#zh/${language}/${decodeURIComponent(transformdWords)}`, waitOptions);
        await page.reload();
        await page.waitForFunction(selector => !!document.querySelector(selector), {}, selector);
        const datas = await page.evaluate(browserCode, translationId);

        let validId = datas.id;

        if (!TranslationContainer[language]) {
            TranslationContainer[language] = {};
        }

        if(!TranslationContainer['zh']){
            TranslationContainer['zh'] = {};
        }

        while ((validId in TranslationContainer['zh']) && (TranslationContainer['zh'][validId] !== words)) {
            if (!duplicateKeys[validId]) {
                duplicateKeys[validId] = 1;
            } else {
                duplicateKeys[validId] += 1;
            }
            validId = `${validId}-${duplicateKeys[validId]}`;
        }

        TranslationContainer[language][validId] = datas.translation;

        return validId;
    } catch (e) {
        console.log(`翻译【${words}】至语言【${LanguageMapping[language]}】失败：`, e);
        return null;
    }
}