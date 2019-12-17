// https://babeljs.io/docs/en/next/babel-parser#ECMAScript-proposals
// Babel AST 解析选项设置

module.exports = function (isFlow) {
    return {
        sourceType: 'unambiguous',
        plugins: [
            'jsx',
            isFlow ? 'flow' : 'typescript',
            ['decorators', { decoratorsBeforeExport: true }],
            'asyncGenerators',
            'bigInt',
            'classProperties',
            'classPrivateProperties',
            'dynamicImport',
            'exportDefaultFrom',
            'exportNamespaceFrom',
            'objectRestSpread',
            'optionalCatchBinding',
            'throwExpressions',
            'topLevelAwait'
        ],
    }
};