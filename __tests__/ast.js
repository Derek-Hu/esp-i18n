import i18n from '~/main';

describe('解析百度翻译页面结果', () => {
    beforeAll(async () => {
        console.log('i18n', i18n, process.cwd());
        i18n({
            // 扫描目录
            folders: ['test'],
            excludes: ['test/code/vue', 'test/code/placeholder', 'test/intl.js'],
            localTools: '~/locale-tools',
            target: 'test/locale',
            headless: false,
            srcCopyFolder: 'dist',
        });
    });

    it('存在关键字', async () => {
        // const text = await page.evaluate(browserFunction, null);
        // expect(text.id.indexOf('business-contract')).not.toEqual(-1);
        // expect(text.translation).not.toBeFalsy();
    });
});