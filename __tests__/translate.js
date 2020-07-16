import path from 'path';
import fs from 'fs';
import i18n from '~/main';
import parseParam from '~/param';

const toolPath = '~/locale-tools';
const encode = 'UTF8';
const targetLocale = 'test/locale-t';
const parseLocalJson = (source) => {
    return JSON.parse(source.replace('export default ', ''));
}
jest.setTimeout(30000);

describe('正确增加ID', () => {
    const pamras = {
        // 扫描目录
        folders: ['test/code/translate'],
        localTools: toolPath,
        // translate: ['th'],
        target: targetLocale,
        srcCopyFolder: 'dist',
    };

    const parsed = parseParam(pamras);
    const baseFolder = parsed.srcTarget;

    beforeAll(async () => {
        await i18n(pamras);
    });

    it('无需启动浏览器，自动翻译', async () => {
        const zhAfter = parseLocalJson(fs.readFileSync(path.resolve(parsed.target, 'zh.js'), encode));
        const enAfter = parseLocalJson(fs.readFileSync(path.resolve(parsed.target, 'en.js'), encode));

        const zhBefore = parseLocalJson(fs.readFileSync(path.resolve(process.cwd(), targetLocale, 'zh.js'), encode));
        const enBefore = parseLocalJson(fs.readFileSync(path.resolve(process.cwd(), targetLocale, 'en.js'), encode));

        const zhSize = Object.keys(zhAfter).length;
        const enSize = Object.keys(enAfter).length;

        expect(zhSize === enSize).toBe(true);

        const allBefore = {
            ...zhBefore,
            ...enBefore,
        }
        expect(Object.keys(allBefore).every(before => {
            return ((before in zhAfter) && (before in enAfter));
        })).toBe(true);

        expect(zhAfter['welcome']).toBe('欢迎 ');
        expect(zhAfter['how-are-you-1']).toBe(' 你好吗  ');
        expect(zhAfter['how-are-you-2']).toBe('你好吗  ');
        expect(zhAfter['how-are-you-3']).toBe('你好吗 ');
        expect(zhAfter['status-1']).toBe('状态');

        expect(enBefore['status-1']).toBe('state');
        expect(enBefore['hello']).toBe('hello');
    });



});