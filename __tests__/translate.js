import path from 'path';
import fs from 'fs';
import i18n from '~/main';
import parseParam from '~/param';

const toolPath = '~/locale-tools';
const encode = 'UTF8';

jest.setTimeout(30000);

describe('正确增加ID', () => {
    const pamras = {
        // 扫描目录
        folders: ['test/code/translate'],
        localTools: toolPath,
        // translate: ['th'],
        target: 'test/locale-t',
        srcCopyFolder: 'dist',
    };

    const parsed = parseParam(pamras);
    const baseFolder = parsed.srcTarget;

    beforeAll(async () => {
        await i18n(pamras);
    });


});