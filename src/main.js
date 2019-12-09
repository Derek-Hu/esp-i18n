const fs = require('fs');
const path = require('path');
const esprima = require('esprima');
const Utils = require('./utils');

const folders = ['src/pages/error'];
const baseFolder = '/Users/hubenlv/workspaces/rc-frontend';
const localToolsPath = '~/locale-tools';

const target = path.resolve(process.cwd(), 'build');

function getJSFileList(root) {
    // console.log('root', root);
    let res = [];
    let files = fs.readdirSync(root);

    files.forEach(file => {
        const pathname = path.join(root, file);
        const stat = fs.lstatSync(pathname);

        if (!stat.isDirectory() && /\.js$/.test(pathname)) {
            res.push(pathname);
        } else {
            res = res.concat(getFileList(pathname));
        }
    });
    // console.log(res);
    return res;
}

function isChineaseText(value) {
    return /[\u4e00-\u9fa5]/.test(value);
}
function getId(value, file) {
    return value;
}
const Types = {
    JSXText: 'JSXText',
    JSXAttribute: 'JSXAttribute',
};
function isChinaCall(node, meta, file, hasImportLocaleTools) {

    if (node.type === 'JSXAttribute' || node.type === 'JSXText' || node.type === 'ImportSpecifier') {
        console.log(node);
            console.log('-------------');
    }
    const hasImported = (node.type === 'ImportDeclaration' && node.source.value === localToolsPath);
    const type = Types[node.type];
    const value = type && type === 'JSXAttribute' ? node.value.value : node.value;
    const isJSXAttribute = type === 'JSXAttribute';
    const attr = isJSXAttribute ? node.name.name : null;
    if (type && isChineaseText(value)) {
        const id = getId(value, file);
        return {
            isComponent: !isJSXAttribute,
            attr: attr,
            start: meta.start.offset,
            end: meta.end.offset,
            hasImported: hasImported,
            replace: isJSXAttribute ? `${attr}={formatMessage({id: '${id}'})}`:`<FormattedMessage id="${id}" />`
        }
    }
}

folders.forEach(folder => {
    const jsFiles = getJSFileList(path.resolve(baseFolder, folder));
    // console.log(jsFiles);
    jsFiles.forEach(file => {
        const entries = [];
        let source = fs.readFileSync(file, 'UTF8').replace(/@/g, '');
        // console.log(source);
        let hasImported = false;
        let importMeta = null;
        const importToolNames = [];
        const nameMapping = {};

        esprima.parseModule(source, { jsx: true, tokens: true }, function (node, meta) {
            if (!hasImported) {
                hasImported = (node.type === 'ImportDeclaration' && node.source.value === localToolsPath);
                if (hasImported) {
                    console.log(node);
                    node.specifiers.forEach(spec => {
                        nameMapping[spec.imported.name] = spec.local.name;
                        importToolNames.push(spec.imported.name);
                    });

                    importMeta = {
                        start: meta.start.offset,
                        end: meta.end.offset,
                    }
                }
            }

            const call = isChinaCall(node, meta, file);
            if (call) {
                entries.push(call);
            }
        });
        // console.log(JSON.stringify(results));
        // 动态计算 import { formatMessage, FormattedMessage } from ${localToolsPath};

        const hasJSToolImport = entries.some(entry => !entry.isComponent);
        const hasCompToolImport = entries.some(entry => entry.isComponent);

        // const keys = ['formatMessage', 'FormattedMessage'];
        const metas = {
            formatMessage: hasJSToolImport,
            FormattedMessage: hasCompToolImport,
        }
        Object.keys(metas).forEach((key, index) => {
            if (metas[key]) {
                console.log(key, nameMapping[key], nameMapping[key]!== key);
                if(nameMapping[key] && (nameMapping[key]!== key)){
                    importToolNames.push(`${key} as ${nameMapping[key]}`);
                }else{
                    importToolNames.push(key);
                }
            }
        })
        console.log(importToolNames);
        let finalImport;
        if (importToolNames.length) {
            finalImport = `import { ${importToolNames.join(', ')} } from '${localToolsPath}';\n`;
        }


        const sortedEntries = entries.sort((a, b) => { return b.end - a.end });
        if(hasImported && finalImport){
            sortedEntries.push(Object.assign({}, importMeta, {
                replace: finalImport
            }));
        }
        
        sortedEntries.forEach(n => {
            source = source.slice(0, n.start) + n.replace + source.slice(n.end);
        });

        if(finalImport && !hasImported){
            source = finalImport + source;
        }
        Utils.writeSync(path.resolve(target, path.relative(baseFolder, file)), source)
    })
})

