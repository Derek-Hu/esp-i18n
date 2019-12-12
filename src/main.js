const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const traverse = require("@babel/traverse").default;
const babelParser = require("@babel/parser");
const Utils = require('./utils');
const LanguageMapping = require('./languages');
const Constant = require('./constant');
const loadLocales = require('./load');

function isChineaseText(value) {
    return value && /[\u4e00-\u9fa5]/.test(value);
}
function getJSFileList(root) {
    let res = [];
    let files = fs.readdirSync(root);

    files.forEach(file => {
        const pathname = path.join(root, file);
        const stat = fs.lstatSync(pathname);

        if (!stat.isDirectory() && /\.(js|jsx|ts|tsx)$/.test(pathname)) {
            res.push(pathname);
        } else if (stat.isDirectory()) {
            res = res.concat(getJSFileList(pathname));
        }
    });
    return res;
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports = async (params) => {
    if(!params){
        params = {};
    }
    const folders = params.folders || [];
    const baseFolder = process.cwd();
    const srcTarget = path.resolve(process.cwd(), params.srcCopyFolder || '');
    const localToolsPath = params.localTools || 'umi-plugin-locale';
    const target = path.resolve(process.cwd(), params.target || 'src/locale');
    const excludesFolders = params.excludes || [];
    const translateLanguages = params.translate && params.translate.length ? params.translate : ['en'];

    const excludes = excludesFolders.map(exclude => path.resolve(process.cwd(), exclude));
    excludes.push(target);

    console.log('Excludes: ' + excludes);

    const isFlow = params.isFlow === true;

    const PluginOptions = {
        sourceType: 'unambiguous',
        // https://babeljs.io/docs/en/next/babel-parser#ECMAScript-proposals
        plugins: [
            'jsx',
            isFlow? 'flow':'typescript',
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
    };

    const Types = {
        jsFunc: params.jsName || 'formatMessage',
        compName: params.componentName || 'FormattedMessage'
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

    const TranslationContainer = loadLocales(translateLanguages, target, LanguageMapping);
    if(!TranslationContainer['zh']){
        TranslationContainer['zh'] = {};
    }
    const chinaValueKeyMapping = {};
    const duplicateKeys = {};
    const waitOptions = { waitUntil: 'networkidle0' };
    async function translation(words, language, translationId) {
        
        const transformdWords = words ? words.replace(/\%/g, '') : '';
        
        const selector = 'p.ordinary-output.target-output';
        try {
            await page.goto(`https://fanyi.baidu.com/#zh/${language}/${decodeURIComponent(transformdWords)}`, waitOptions);
            await page.reload();
            await page.waitForFunction(selector => !!document.querySelector(selector), {}, selector);
            const datas = await page.evaluate((translatedId) => {
                function formatWord(word) {
                    return word.toLowerCase().replace(/[,.:/|']/g, '').trim().replace(/\s/g, '-');
                }
                const maxWords = 4;
                const keywordsSelector = 'ul.keywords-container li.keywords-content .keywords-means';

                const translationEle = document.querySelector('p.ordinary-output.target-output');
                const translation = translationEle.textContent.trim();
                if (translatedId) {
                    return {
                        id: translatedId,
                        translation: translation
                    }
                }

                const keyMeansElems = document.querySelectorAll(keywordsSelector) || [];
                const keyMeans = Array.prototype.slice.call(keyMeansElems).map(ele => ele.textContent);

                let id = null;
                const translationParts = translation.split(' ');
                if (translationParts.length <= maxWords) {
                    id = formatWord(translation);
                } else if (keyMeans && keyMeans.length) {
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
                } else {
                    id = translationParts.reduce((means, word, index) => {
                        if (index >= maxWords) {
                            return means;
                        }
                        means.push(formatWord(word));
                        return means;
                    }, []).join('-');
                    
                }
                return {
                    id: id,
                    translation: translation
                };
            }, translationId);

            let validId = datas.id;

            if ((validId in TranslationContainer['zh']) && (TranslationContainer['zh'][validId] !== words)) {
                if (duplicateKeys[validId]) {
                    duplicateKeys[validId] += 1;
                } else {
                    duplicateKeys[validId] = 1;
                }
                validId = `${validId}-${duplicateKeys[datas.id]}`;
            }

            if (!TranslationContainer[language]) {
                TranslationContainer[language] = {};
            }

            TranslationContainer[language][validId] = datas.translation;

            return validId;
        } catch (e) {
            console.log(e);
            return words;
        }
    }

    async function getId(value) {
        const id = await translation(value, 'en');
        TranslationContainer['zh'][id] = value;
        chinaValueKeyMapping[value] = id;

        await asyncForEach(translateLanguages, async code => {
            if (code === 'en' || code === 'zh') {
                return;
            }
            if (!code || !LanguageMapping[code]) {
                console.warn(`当前暂不支持中文翻译至${code}`)
                return;
            }
            await translation(value, code, id);
        })
        return `${id ? id : value}`;
    }

    await asyncForEach(folders, async folder => {
        const jsFiles = getJSFileList(path.resolve(baseFolder, folder));
        await asyncForEach(jsFiles, async file => {
            const isExcludes = excludes.some(exclude => {
                return file.indexOf(exclude) === 0;
            });
            if (isExcludes) {
                return;
            }
            const entries = [];
            const fileContent = fs.readFileSync(file, 'UTF8');
            let source = fileContent;
            let hasImported = false;
            let importMeta = null;
            const importToolNames = [];
            const nameMapping = {};

            try {
                const astTree = babelParser.parse(source, PluginOptions);
                traverse(astTree, {
                    StringLiteral(_node) {
                        if (['ImportDeclaration', 'JSXAttribute', 'JSXText'].includes(_node.parent.type)) {
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
                        const value = node.value && node.value.value;
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

                await asyncForEach(entries, async entry => {
                    if (entry.value) {
                        entry.value = entry.value.trim();
                    }
                    if (chinaValueKeyMapping[entry.value] !== undefined) {
                        entry.id = chinaValueKeyMapping[entry.value];
                    } else {
                        entry.id = await getId(entry.value, entry.file);
                    }
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
                    // console.log('解析完成: ' + file);
                    Utils.writeSync(path.resolve(srcTarget, path.relative(baseFolder, file)), source);
                }
            } catch (e) {
                console.log(`解析文件失败：${file}`, e);
            }
        });
    });

    const hasEnglish = translateLanguages.indexOf('en') !== -1;
    Object.keys(TranslationContainer).forEach(language => {
        if (!hasEnglish && language === 'en') {
            return;
        }
        Utils.writeSync(path.resolve(target, `${language}.js`), `${Constant.Header}${JSON.stringify(TranslationContainer[language], null, 2)}`);
    })

    await browser.close();
}