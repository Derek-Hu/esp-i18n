// 解析用户传入参数

const path = require('path');
const vue = require('./vue');

module.exports = function (params) {
    if (!params) {
        params = {};
    }
    const target = path.resolve(process.cwd(), params.target || 'src/locale');
    const excludesFolders = params.excludes || [];
    const translateLanguages = params.translate && params.translate.length ? params.translate : ['en'];
    const excludes = excludesFolders.map(exclude => path.resolve(process.cwd(), exclude));
    excludes.push(target);

    const hasEnglish = translateLanguages.indexOf('en') !== -1;

    console.log('Excludes: ' + excludes);

    return {
        folders: params.folders || [],
        baseFolder: process.cwd(),
        srcTarget: path.resolve(process.cwd(), params.srcCopyFolder || ''),
        localToolsPath: params.localTools || 'umi-plugin-locale',
        isFlow: params.isFlow === true,
        args: params.args,
        target: target,
        getSource: function(path, content) {
            if (/\.vue$/.test(path)) {
                var contentOneLine = vue(path, content);;
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
        hasEnglish: hasEnglish,
        translateLanguages: translateLanguages,
        excludes: excludes,
        types: {
            jsFunc: params.jsName || 'formatMessage',
            compName: params.componentName || 'FormattedMessage'
        }
    }
}