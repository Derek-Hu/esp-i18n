const i18n = require('../../src/main');

i18n({
    // 扫描目录
    folders: ['test/code'],
    // 忽略/排除目录，默认会忽略掉[target]参数指定的目录
    // excludes: ['test/code/vue', 'test/code/placeholder', 'test/intl.js'],
    // 自定义工具，默认为：import { FormattedMessage, formatMessage } from '~/locale-tools';
    // 使用[jsName]和[componentName]自定义工具名称
    // 使用[localTools]指定引用路径，默认为'umi-plugin-locale'
    localTools: '~/locale-tools',

    // Default Name: formatMessage
    // jsName: 'formatMessage',

    // Default Name: FormattedMessage
    // componentName: 'FormattedMessage',

    // 需进行翻译的语言，如从中文翻译至英文、泰文等，默认为英文，即['en']
    translate: ['en', 'th'],

    // 指定zh.js en.js 生成的目录，默认为'src/locale'
    target: 'test/locale',
    // 是否打开浏览器，可查看自动抓取翻译等效果，若浏览器页面出现卡顿，在此模式下则可人工干预；默认为关闭
    headless: false,

    // 代码为Flow类型，而非Typescript
    // isFlow: true,

    // 指定保存修改后的代码路径，默认为覆盖源文件
    // srcCopyFolder: 'dist',

    idName: 'i18n'
})