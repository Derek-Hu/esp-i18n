const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const esprima = require('esprima');
var acorn = require('acorn');
const walk = require("acorn-walk")
var injectAcornJsx = require('acorn-jsx/inject');
var injectAcornObjectRestSpread = require('acorn-object-rest-spread/inject');
var injectAcornStaticClassPropertyInitializer = require('acorn-static-class-property-initializer/inject');
injectAcornJsx(acorn);
injectAcornObjectRestSpread(acorn);
injectAcornStaticClassPropertyInitializer(acorn);
acorn = require('acorn-es7')(acorn)
// acorn = require('acorn-es7-plugin')(acorn);
acorn = require('acorn-stage3/inject')(acorn);

const Utils = require('./utils');
const Types = {
    JSXText: 'JSXText',
    JSXAttribute: 'JSXAttribute',
};
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
            // console.log('pathname', pathname)
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

    function isChinaCall(node, file, nameMapping) {
        const Names = {
            formatMessage: nameMapping['formatMessage'] || 'formatMessage',
            FormattedMessage: nameMapping['FormattedMessage'] || 'FormattedMessage',
        }
        const hasImported = (node.type === 'ImportDeclaration' && node.source.value === localToolsPath);
        const type = Types[node.type];
        const value = type && type === 'JSXAttribute' ? node.value.value : node.value;
        const isJSXAttribute = type === 'JSXAttribute';
        const attr = isJSXAttribute ? node.name.name : null;
        if (type && isChineaseText(value)) {
            return {
                isComponent: !isJSXAttribute,
                attr: attr,
                start: node.start,
                end: node.end,
                hasImported: hasImported,
                value: value,
                file: file,
                getReplacement: (id) => isJSXAttribute ? `${attr}={${Names['formatMessage']}({id: '${id}'})}` : `<${Names['FormattedMessage']} id="${id}" />`
            }
        }
    }

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
        // await page.reload();
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
            // let source = fileContent.replace(/@/g, '');
            let source = fileContent;
            let hasImported = false;
            let importMeta = null;
            const importToolNames = [];
            const nameMapping = {};

            try {
                const astTree = acorn.parse(source, {
                    sourceType: 'module',
                    plugins: {
                        jsx: {
                            allowNamespacedObjects: true
                        },
                        objectRestSpread: true,
                        staticClassPropertyInitializer: true,
                        es7:true,
                        stage3: true
                    },
                    ecmaVersion:7
                });
                console.log(JSON.stringify(astTree));
                // walk.full((astTree), node => {
                        // console.log(node);
                        // return;
                        // console.log(`Found a literal: `, node);
                        // if (!hasImported) {
                        //     hasImported = (node.type === 'ImportDeclaration' && node.source.value === localToolsPath);
                        //     if (hasImported) {
                        //         console.log(node);
                        //         node.specifiers.forEach(spec => {
                        //             nameMapping[spec.imported.name] = spec.local.name;
                        //             importToolNames.push(`${spec.imported.name}${spec.imported.name !== spec.local.name ? ` as ${spec.local.name}` : ''}`);
                        //         });
                        //         importMeta = {
                        //             start: node.start,
                        //             end: node.end,
                        //         }
                        //     }
                        // }
    
                        // const call = isChinaCall(node, file, nameMapping);
                        // if (call) {
                        //     entries.push(call);
                        // }
                // });
                console.log('entries', entries)
                // esprima.parseModule(source, { jsx: true }, function (node, meta) {
                //     if (!hasImported) {
                //         hasImported = (node.type === 'ImportDeclaration' && node.source.value === localToolsPath);
                //         if (hasImported) {
                //             node.specifiers.forEach(spec => {
                //                 nameMapping[spec.imported.name] = spec.local.name;
                //                 importToolNames.push(`${spec.imported.name}${spec.imported.name !== spec.local.name ? ` as ${spec.local.name}` : ''}`);
                //             });

                //             importMeta = {
                //                 start: meta.start.offset,
                //                 end: meta.end.offset,
                //             }
                //         }
                //     }

                //     const call = isChinaCall(node, meta, file, nameMapping);
                //     if (call) {
                //         entries.push(call);
                //     }
                // });

                await asyncForEach(entries, async entry => {
                    entry.id = await getId(entry.value, entry.file);
                });
                // 动态计算 import { formatMessage, FormattedMessage } from ${localToolsPath};
                const hasJSToolImport = entries.some(entry => !entry.isComponent);
                const hasCompToolImport = entries.some(entry => entry.isComponent);

                const metas = {
                    formatMessage: hasJSToolImport,
                    FormattedMessage: hasCompToolImport,
                }
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