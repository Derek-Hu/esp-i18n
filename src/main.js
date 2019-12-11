const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const traverse = require("@babel/traverse").default;
const babelParser = require("@babel/parser");
const Utils = require('./utils');

const Types = {
    jsFunc: 'formatMessage',
    compName: 'FormattedMessage'
}
function isChineaseText(value) {
    return /[\u4e00-\u9fa5]/.test(value);
}
function getJSFileList(root) {
    let res = [];
    let files = fs.readdirSync(root);

    files.forEach(file => {
        const pathname = path.join(root, file);
        const stat = fs.lstatSync(pathname);

        if (!stat.isDirectory() && /\.js$/.test(pathname)) {
            res.push(pathname);
        } else if (stat.isDirectory()) {
            res = res.concat(getJSFileList(pathname));
        }
    });
    return res;
}

module.exports = async (params) => {
    const folders = params.folders || [];
    const baseFolder = process.cwd();
    const srcTarget = path.resolve(process.cwd(), params.srcCopyFolder || '');
    const localToolsPath = params.localTools || '~/locale-tools';
    const target = path.resolve(process.cwd(), params.target);

    const browser = await puppeteer.launch({
        headless: params.headless !== false
    });

    process.on('uncaughtException', async function () {
        await browser.close();
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1680,
        height: 947,
        deviceScaleFactor: 1,
    });

    const englishJSON = {};
    const chinaJSON = {};
    const duplicateKeys = {};

    async function translation(words) {
        const selector = 'p.ordinary-output.target-output';
        await page.goto(`https://fanyi.baidu.com/#zh/en/${decodeURIComponent(words)}`, { waitUntil: 'networkidle0' });
        await page.reload();
        await page.waitForFunction(selector => !!document.querySelector(selector), {}, selector);
        try {
            const datas = await page.evaluate(() => {
                function formatWord(word) {
                    return word.toLowerCase().replace(/[,.:']/g, '').trim().replace(/\s/g, '-');
                }

                const translationEle = document.querySelector("p.ordinary-output.target-output");
                const keyMeansElems = document.querySelectorAll("ul.keywords-container li.keywords-content .keywords-means");
                const keyMeans = Array.prototype.slice.call(keyMeansElems).map(ele => ele.textContent);
                const translation = translationEle.textContent.trim();

                let id = null;
                const translationParts = translation.split(' ');
                const maxWords = 4;
                if (translationParts.length <= maxWords) {
                    id = formatWord(translation);
                } else {
                    const allFirstMeans = keyMeans.map(means => {
                        const firstMeans = means.split(';');
                        if (firstMeans && firstMeans[0]) {
                            return firstMeans[0];
                        }
                        return '';
                    }).filter(v => v);

                    id = allFirstMeans.reduce((means, word, index) => {
                        if (index >= maxWords) {
                            return means;
                        }
                        means.push(formatWord(word));
                        return means;
                    }, []).join('-');
                }
                return {
                    id: id,
                    english: translation
                };
            }, {});

            let validId = datas.id;

            if ((validId in chinaJSON) && (chinaJSON[validId] !== words)) {
                if (duplicateKeys[validId]) {
                    duplicateKeys[validId] += 1;
                } else {
                    duplicateKeys[validId] = 1;
                }
                validId = `${validId}-${duplicateKeys[datas.id]}`;
            }
            chinaJSON[validId] = words;
            englishJSON[validId] = datas.english;
            return validId;
        } catch (e) {
            console.log(e);
            return words;
        }
    }

    async function getId(value) {
        const id = await translation(value);
        return `${id ? id : value}`;
    }

    async function asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    await asyncForEach(folders, async folder => {
        const jsFiles = getJSFileList(path.resolve(baseFolder, folder));
        await asyncForEach(jsFiles, async file => {

            const entries = [];
            const fileContent = fs.readFileSync(file, 'UTF8');
            let source = fileContent;
            let hasImported = false;
            let importMeta = null;
            const importToolNames = [];
            const nameMapping = {};

            try {
                const astTree = babelParser.parse(source, {
                    sourceType: 'unambiguous',
                    plugins: [
                        'jsx',
                        'typescript',
                        ['decorators', { decoratorsBeforeExport: true }]
                    ],
                });
                traverse(astTree, {
                    StringLiteral(_node){
                        if(['ImportDeclaration', 'JSXAttribute', 'JSXText'].includes(_node.parent.type)){
                            return;
                        }
                        const node = _node.node;
                        const value = node.value;
                        if (!isChineaseText(value)) {
                            return;
                        }
                        const funcName = nameMapping[Types.jsFunc] || Types.jsFunc;
                        const call = {
                            isComponent: false,
                            start: node.start,
                            end: node.end,
                            value: value,
                            file: file,
                            getReplacement: (id) => `${funcName}({id: '${id}'})`
                        }
                        entries.push(call);
                    },
                    ImportDeclaration(_node) {
                        const node = _node.node;
                        // console.log('ImportDeclaration', JSON.stringify(node));
                        if (!hasImported) {
                            hasImported = (node.type === 'ImportDeclaration' && node.source.value === localToolsPath);
                            if (hasImported) {
                                node.specifiers.forEach(spec => {
                                    nameMapping[spec.imported.name] = spec.local.name;
                                    importToolNames.push(`${spec.imported.name}${spec.imported.name !== spec.local.name ? ` as ${spec.local.name}` : ''}`);
                                });
                                importMeta = {
                                    start: node.start,
                                    end: node.end,
                                }
                            }
                        }
                    },
                    JSXAttribute(_node) {
                        const node = _node.node;
                        const value = node.value.value;
                        if (!isChineaseText(value)) {
                            return;
                        }
                        const funcName = nameMapping[Types.jsFunc] || Types.jsFunc;
                        const attr = node.name.name;

                        const call = {
                            isComponent: false,
                            start: node.start,
                            end: node.end,
                            value: value,
                            file: file,
                            getReplacement: (id) => `${attr}={${funcName}({id: '${id}'})}`
                        }
                        entries.push(call);

                    },
                    JSXText(_node) {
                        const node = _node.node;
                        const value = node.value;
                        if (!isChineaseText(value)) {
                            return;
                        }
                        const funcName = nameMapping[Types.compName] || Types.compName;

                        const call = {
                            isComponent: true,
                            start: node.start,
                            end: node.end,
                            value: value,
                            file: file,
                            getReplacement: (id) => `<${funcName} id="${id}" />`
                        }
                        entries.push(call);
                    }
                });
                // console.log('entries', entries);

                await asyncForEach(entries, async entry => {
                    entry.id = await getId(entry.value, entry.file);
                });
                // 动态计算 import { formatMessage, FormattedMessage } from ${localToolsPath};
                const hasJSToolImport = entries.some(entry => !entry.isComponent);
                const hasCompToolImport = entries.some(entry => entry.isComponent);

                const metas = {};
                metas[Types.jsFunc] = hasJSToolImport;
                metas[Types.compName] = hasCompToolImport;
                
                Object.keys(metas).forEach((key) => {
                    if (metas[key]) {
                        let statement = null;
                        if (nameMapping[key] && (nameMapping[key] !== key)) {
                            statement = `${key} as ${nameMapping[key]}`;
                        } else {
                            statement = key;
                        }
                        if (statement && !importToolNames.includes(statement)) {
                            importToolNames.push(statement);
                        }
                    }
                })
                let finalImport;
                if (importToolNames.length) {
                    finalImport = `import { ${importToolNames.join(', ')} } from '${localToolsPath}';\n`;
                }

                const sortedEntries = entries.sort((a, b) => { return b.end - a.end });
                if (hasImported && finalImport) {
                    sortedEntries.push(Object.assign({}, importMeta, {
                        getReplacement: () => finalImport
                    }));
                }

                sortedEntries.forEach(n => {
                    source = source.slice(0, n.start) + n.getReplacement(n.id) + source.slice(n.end);
                });

                if (finalImport && !hasImported) {
                    source = finalImport + source;
                }
                if (sortedEntries.length) {
                    Utils.writeSync(path.resolve(srcTarget, path.relative(baseFolder, file)), source);
                }
            } catch (e) {
                console.log(`解析文件失败：${file}`, e);
            }
        });
    });

    Utils.writeSync(path.resolve(target, 'zh_CN.js'), `export default ${JSON.stringify(chinaJSON, null, 2)}`);
    Utils.writeSync(path.resolve(target, 'en_US.js'), `export default ${JSON.stringify(englishJSON, null, 2)}`);

    await browser.close();
}