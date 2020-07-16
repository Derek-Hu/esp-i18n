const i18n = require('../../src/main');
const toolPath = '~/locale-tools';

const pamras = {
    // 扫描目录
    folders: ['test/code/ast', 
    // 'test/code/remote', 
    'test/result'],
    // excludes: ['test/code/vue', 'test/code/placeholder', 'test/code/translate', 'test/locale-script'],
    localTools: toolPath,
    headless: false,
    translate: ['th'],
    target: 'test/locale',
    srcCopyFolder: 'dist',
};

i18n(pamras);
