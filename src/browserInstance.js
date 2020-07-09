const puppeteer = require('puppeteer');

['SIGINT', 'SIGTERM'].forEach(function (sig) {
    process.on(sig, async () => {
        closeBrowser();
    });
});

let page;
let browserInstance;

const closeBrowser = async () => {
    if (browserInstance) {
        await browserInstance.close();
    }
}
module.exports.close = closeBrowser;

module.exports.getPage = async function (launchOptions) {

    if (!browserInstance) {
        browserInstance = await puppeteer.launch({
            headless: launchOptions.headless !== false,
            args: launchOptions.args,
        });
    }
    if (!page) {
        page = await browserInstance.newPage();
        await page.setViewport({
            width: 1680,
            height: 947,
            deviceScaleFactor: 1,
        });
    }
    return page;
}