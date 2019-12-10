const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const esprima = require('esprima');
const Utils = require('./utils');

const folders = ['src/pages/error'];
const baseFolder = '/Users/hubenlv/workspaces/rc-frontend';
const localToolsPath = '~/locale-tools';

const target = path.resolve(process.cwd(), 'build');

const Types = {
    JSXText: 'JSXText',
    JSXAttribute: 'JSXAttribute',
};
function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
function isChineaseText(value) {
    return /[\u4e00-\u9fa5]/.test(value);
}
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

(async () => {
    function isChinaCall(node, meta, file, nameMapping) {
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
                start: meta.start.offset,
                end: meta.end.offset,
                hasImported: hasImported,
                value: value,
                file: file,
                getReplacement: (id) => isJSXAttribute ? `${attr}={${Names['formatMessage']}({id: '${id}'})}` : `<${Names['FormattedMessage']} id="${id}" />`
            }
        }
    }

    const browser = await puppeteer.launch({
        headless: false
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

    async function translation(words) {
        const selector = 'p.ordinary-output.target-output';
        await page.goto(`https://fanyi.baidu.com/#zh/en/${decodeURIComponent(words)}`, { waitUntil: 'networkidle0' });
        await page.reload();
        await page.waitForFunction(selector => !!document.querySelector(selector), {}, selector);
        // await page.reload();
        try {
            const datas = await page.evaluate(() => {
                function formatWord(word) {
                    return word.toLowerCase().replace(/[,.']/g, '').trim().replace(/\s/g, '-');
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

                    console.log('allFirstMeans', allFirstMeans);
                    debugger;
                    id = allFirstMeans.reduce((means, word, index) => {
                        if (index >= maxWords) {
                            return means;
                        }
                        means.push(formatWord(word));
                        return means;
                    }, []).join('-');
                }
                debugger;
                return {
                    id: id,
                    english: translation
                };
            }, {});

            console.log('datas', datas);

            chinaJSON[datas.id] = words;
            englishJSON[datas.id] = datas.english;
            return datas && datas.id ? datas.id : words;
        } catch (e) {
            console.log(e);
            return words;
        }
    }

    async function getId(value, file) {
        const relativePath = path.relative(baseFolder, file);
        const parts = relativePath.split(/[\\\/]/);
        const name = parts.reduce((names, part, index) => {
            if (index === 0) {
                if (part === 'src') {
                    return names;
                }
                names.push(part);
            } else {
                names.push(part[0] + part.substring(1));
            }
            return names;
        }, []).join('-');
        const id = await translation(value);
        console.log('id: ', id);
        return `${name.replace(/\.js$/, '')}.${id ? id : value}`;
    }

    async function asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    await asyncForEach(folders, async folder => {
        const jsFiles = getJSFileList(path.resolve(baseFolder, folder));
        // console.log(jsFiles);
        await asyncForEach(jsFiles, async file => {

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
                        // console.log(node);
                        node.specifiers.forEach(spec => {
                            nameMapping[spec.imported.name] = spec.local.name;
                            importToolNames.push(`${spec.imported.name}${spec.imported.name !== spec.local.name ? ` as ${spec.local.name}` : ''}`);
                        });

                        importMeta = {
                            start: meta.start.offset,
                            end: meta.end.offset,
                        }
                    }
                }

                const call = isChinaCall(node, meta, file, nameMapping);
                if (call) {
                    entries.push(call);
                }
            });
            // console.log(entries);

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
                    console.log(key, nameMapping[key], nameMapping);
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
            Utils.writeSync(path.resolve(target, path.relative(baseFolder, file)), source);
        });
    });

    Utils.writeSync(path.resolve(target, 'zh_CN.js'), `export default ${JSON.stringify(chinaJSON, null, 2)}`);
    Utils.writeSync(path.resolve(target, 'en_US.js'), `export default ${JSON.stringify(englishJSON, null, 2)}`);

    await browser.close();
})();