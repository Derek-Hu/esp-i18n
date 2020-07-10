import path from 'path';
import fs from 'fs';
import parseParam from '~/param';
import i18n from '~/main';
import Utils from '~/utils';

const encode = 'UTF8';
const toolPath = '~/locale-tools';
const filePath = 'test/code/placeholder';

jest.setTimeout(30000);

describe('解析百度翻译页面结果', () => {
    const pamras = {
        // 扫描目录
        folders: [filePath],
        localTools: toolPath,
        target: 'test/locale',
        srcCopyFolder: 'dist',
    };

    const parsed = parseParam(pamras);
    const baseFolder = parsed.srcTarget;

    beforeAll(async () => {
        await i18n(pamras);
    });

    it('正确处理placeholder中各类文件', async () => {
        const files = Utils.getProcessFiles([baseFolder]);
        files.forEach(file => {
            const after = fs.readFileSync(file, encode);
            expect(after.indexOf(` formatMessage`)!==-1).toBe(true);
            expect(after.indexOf(`from '~/locale-tools';`)!==-1).toBe(true);
        })
    });

});