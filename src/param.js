// 解析用户传入参数
const LanguageMapping = require('./languages');
const path = require('path');

module.exports = function (params) {
    if (!params) {
        params = {};
    }
    if(!params.folders){
        throw new Error('请提供参数folders，以指定要扫描的目录');
    }
    params.folders.forEach(folder => {
        if(typeof folder !== 'string'){
            throw new Error('参数folders为字符串数组，Received: ', params.folders);
        }
    });
    const target = path.resolve(process.cwd(), params.target || 'src/locale');
    const excludesFolders = params.excludes || [];
    if(params.translate && !Array.isArray(params.translate)){
        throw new Error(`translate配置为字符串数组，如['en']，支持列表见 https://github.com/Derek-Hu/esp-i18n/blob/master/src/languages.js`)
    }
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

    if(!translateLanguages.includes('zh')){
        translateLanguages.push('zh');
    }

    const launchOptions = {
        args: params.args,
        headless: params.headless,
    };
    if(typeof params.localTools !== 'string'){
        throw new Error(`请配置localTools参数，以提供i18n工具函数。如localTools配置为'~/localTools', 则生成代码import {formatMessage} from '~/localTools'`);
    }
    if(params.idName!==null && params.idName!==undefined && !/^[_$a-zA-Z][a-zA-Z_$\d]*/.test(params.idName)){
        throw new Error('idName变量只能包含数字、字母、_、$，且不能以数字开头');
    }
    const idName = params.idName || 'i18n';

    return {
        folders: params.folders || [],
        baseFolder: process.cwd(),
        srcTarget: path.resolve(process.cwd(), params.srcCopyFolder || ''),
        localToolsPath: params.localTools,
        isFlow: params.isFlow === true,
        launchOptions,
        target: target,
        idName,
        translateLanguages: translateLanguages,
        excludes: excludes,
        jsFunc: params.jsName || 'formatMessage',
    }
}