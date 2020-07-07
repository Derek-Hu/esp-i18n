// 解析用户传入参数
const LanguageMapping = require('./languages');
const path = require('path');
const vue = require('./vue');

module.exports = function (params) {
    if (!params) {
        params = {};
    }
    const target = path.resolve(process.cwd(), params.target || 'src/locale');
    const excludesFolders = params.excludes || [];
    const translateLanguages = (params.translate && params.translate.length ? params.translate : ['en']).filter(language => {
        if (typeof language === 'string') {
            if (!(language in LanguageMapping)) {
                throw new Error('不支持语言：' + language);
            }
            return true;
        }
        throw new Error(`translate配置为字符串数组，如['en']，支持列表见 https://github.com/Derek-Hu/esp-i18n/blob/master/src/languages.js`)
    });
    const excludes = excludesFolders.map(exclude => path.resolve(process.cwd(), exclude));
    excludes.push(target);

    // const hasEnglish = translateLanguages.indexOf('en') !== -1;

    if(!translateLanguages.includes('zh')){
        translateLanguages.push('zh');
    }

    console.log('Excludes: ' + excludes);

    const launchOptions = {
        args: params.args,
        headless: params.headless,
    };
    if(typeof params.localTools !== 'string'){
        throw new Error(`请配置localTools参数，以提供i18n工具函数。如localTools配置为'~/localTools', 则生成代码import {formatMessage} from '~/localTools'`);
    }
    return {
        folders: params.folders || [],
        baseFolder: process.cwd(),
        srcTarget: path.resolve(process.cwd(), params.srcCopyFolder || ''),
        localToolsPath: params.localTools,
        isFlow: params.isFlow === true,
        launchOptions,
        target: target,
        getSource: async function (path, content) {
            if (/\.vue$/.test(path)) {
                var contentOneLine = await vue(path, content, launchOptions);
                const placeholder = '________';
                const scripts = '<script>' + placeholder + '</script>';
                const matchs = contentOneLine.match(/<script>((.*\n)*)<\/script>/);
                const validContent = matchs && matchs[1];

                return [
                    validContent,
                    contentOneLine.replace(/<script>((.*\n)*)<\/script>/, scripts),
                    placeholder
                ];
            }
            return [content];
        },
        // hasEnglish: hasEnglish,
        translateLanguages: translateLanguages,
        excludes: excludes,
        jsFunc: params.jsName || 'formatMessage',
    }
}