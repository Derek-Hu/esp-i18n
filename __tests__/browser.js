import fs from 'fs';
import path from 'path';

const broserCode = fs.readFileSync(path.resolve(__dirname, '../src/browser.js'), 'UTF8');
const codeBody = broserCode.replace('module.exports = function (translatedId) {', '').replace(/}[^}]*$/, '');

const browserFunction = new Function('translatedId', codeBody);

jest.setTimeout(30000);

const sleep = (ms) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, ms);
    })
}

describe('解析百度翻译页面结果', () => {
    const word = '请输入贸易合同编号';

    beforeAll(async () => {
        await page.goto(`https://fanyi.baidu.com/#zh/en/${decodeURIComponent(word)}`, { waitUntil: 'networkidle0' });
    });

    it('存在关键字', async () => {
        await sleep(3000);
        const text = await page.evaluate(browserFunction, null);
        expect(text.id.indexOf('business-contract')).not.toEqual(-1);
        expect(text.translation).not.toBeFalsy();
    });
});