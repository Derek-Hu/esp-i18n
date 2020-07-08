const babelParser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const Utils = require('./utils');

module.exports = (source, babelConfig, { localToolsPath, jsFunc }) => {

    const entries = [];

    const importedAttrs = [];

    const astTree = babelParser.parse(source, babelConfig);
    traverse(astTree, {
        StringLiteral(_node) {
            if (['ImportDeclaration', 'JSXAttribute', 'JSXText'].includes(_node.parent.type)) {
                return;
            }
            const node = _node.node;
            const value = node.value;
            if (!Utils.isChineaseText(value)) {
                return;
            }
            const call = {
                start: node.start,
                end: node.end,
                value: value,
                getReplacement: (id, funcName) => `${funcName}({id: '${id}'})`
            }
            entries.push(call);
        },
        TemplateLiteral(_node) {
            const node = _node.node;
            if (!node.quasis || !node.quasis.length) {
                return;
            }
            node.quasis.forEach((quasi) => {
                const value = quasi.value.raw;
                if (!Utils.isChineaseText(value)) {
                    return;
                }
                entries.push({
                    start: quasi.start,
                    end: quasi.end,
                    value: quasi.value.raw,
                    getReplacement: (id, funcName) => `\${${funcName}({id: '${id}'})}`
                });
            });
        },
        ImportDeclaration(_node) {
            const node = _node.node;
            if (node.source.value !== localToolsPath) {
                return;
            }
            const imported = {
                start: node.start,
                end: node.end,
                attrs: {},
                default: null,
            };
            if (node.specifiers && node.specifiers.length) {
                node.specifiers.forEach(spec => {
                    if (spec.type === 'ImportSpecifier') {
                        imported.attrs[spec.local.name] = spec.imported.name;
                    } else if (spec.type === 'ImportDefaultSpecifier') {
                        imported.default = spec.local.name;
                    }
                });
            }
            importedAttrs.push(imported);
        },
        JSXAttribute(_node) {
            const node = _node.node;
            const value = node.value && node.value.value;
            if (!Utils.isChineaseText(value)) {
                return;
            }
            const attr = node.name.name;

            const call = {
                start: node.start,
                end: node.end,
                value: value,
                getReplacement: (id, funcName) => `${attr}={${funcName}({id: '${id}'})}`
            }
            entries.push(call);

        },
        JSXText(_node) {
            const node = _node.node;
            const value = node.value;
            if (!Utils.isChineaseText(value)) {
                return;
            }
            const call = {
                isComponent: true,
                start: node.start,
                end: node.end,
                value: value,
                getReplacement: (id, funcName) => `{${funcName}({id: '${id}'})}`
            }
            entries.push(call);
        }
    });

    const finalImport = [];
    let finalFuncName = jsFunc;

    if (!entries.length) {
        return {
            finalFuncName,
            entries,
        }
    }
    if (!importedAttrs.length) {
        entries.push({
            start: 0,
            end: 0,
            getReplacement: () => `import { ${finalFuncName} } from '${localToolsPath}';\n`,
        });
    } else {
        const importDefaults = [];
        let importParts = {};
        importedAttrs.forEach(importStatement => {
            if (importStatement.default) {
                importDefaults.push(importStatement.default);
            }
            importParts = {
                ...importParts,
                ...importStatement.attrs,
            }
        });

        // if (importParts[jsFunc] !== jsFunc) {
        finalFuncName = Utils.getUniqueImportId(jsFunc, importParts);
        // }

        importParts[finalFuncName] = jsFunc;

        if (importDefaults.length) {
            importDefaults.forEach(importDefault => {
                finalImport.push(`import ${importDefault} from '${localToolsPath}';\n`)
            });
        }

        const parts = Object.keys(importParts).map(localKey => {
            return importParts[localKey] === localKey ? localKey : `${importParts[localKey]} as ${localKey}`;
        }).join(', ');

        finalImport.push(`import { ${parts} } from '${localToolsPath}';`);

        importedAttrs.forEach((importAttr, index) => {
            entries.push({
                start: importAttr.start,
                end: importAttr.end,
                getReplacement: () => index === 0 ? finalImport.join('') : '',
            });
        });
    }
    return {
        finalFuncName,
        entries: entries.sort((a, b) => { return b.end - a.end }),
    };
}