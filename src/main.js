const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const traverse = require("@babel/traverse").default;
const babelParser = require("@babel/parser");
const Utils = require('./utils');
const LanguageMapping = require('./languages');
const Constant = require('./constant');
const loadLocales = require('./load');
const BabelOption = require('./babel');
const paramParser = require('./param');
const browserCode = require('./browser');

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports = async (params) => {

    const options = paramParser(params);
    const translateLanguages = params.translate && params.translate.length ? params.translate : ['en'];
    const Types = options.types;
    const PluginOptions = BabelOption(options.isFlow);
    
    let browser;

    process.on('uncaughtException', async function () {
        if(browser){
            await browser.close();
        }
    });

    let page;
    async function launchBrowser(){
        browser = await puppeteer.launch({
            headless: params.headless !== false,
            args: options.args,
        });
        page = await browser.newPage();
        await page.setViewport({
            width: 1680,
            height: 947,
            deviceScaleFactor: 1,
        });
    }

    const TranslationContainer = loadLocales(translateLanguages, options.target, LanguageMapping);
    
    const chinaValueKeyMapping = Object.keys(TranslationContainer['zh']).reduce((all, chinaId)=> {
        all[TranslationContainer['zh'][chinaId]] = chinaId;
        return all;
    }, {});

    const duplicateKeys = {};
    const waitOptions = { waitUntil: 'networkidle0' };
    async function translation(words, language, translationId) {
        
        if(!page){
            await launchBrowser();
        }
        const transformdWords = words ? words.replace(/\%/g, '') : '';
        const selector = 'p.ordinary-output.target-output';
        try {
            await page.goto(`https://fanyi.baidu.com/#zh/${language}/${decodeURIComponent(transformdWords)}`, waitOptions);
            await page.reload();
            await page.waitForFunction(selector => !!document.querySelector(selector), {}, selector);
            const datas = await page.evaluate(browserCode, translationId);

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
            console.log(`翻译【${words}】至语言【${LanguageMapping[language]}】失败：`, e);
            return null;
        }
    }

    async function getId(value) {
        const id = await translation(value, 'en');
        if(Utils.isIdEmpty(id)){
            return null;
        }
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
        return id;
    }

    await asyncForEach(options.folders, async folder => {
        const jsFiles = Utils.getJSFileList(path.resolve(options.baseFolder, folder));
        await asyncForEach(jsFiles, async file => {
            const isExcludes = options.excludes.some(exclude => {
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
                        if (!Utils.isChineaseText(value)) {
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
                            hasImported = (node.type === 'ImportDeclaration' && node.source.value === options.localToolsPath);
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
                        if (!Utils.isChineaseText(value)) {
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
                        if (!Utils.isChineaseText(value)) {
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
                    finalImport = `import { ${importToolNames.join(', ')} } from '${options.localToolsPath}';\n`;
                }

                const sortedEntries = entries.sort((a, b) => { return b.end - a.end });
                if (hasImported && finalImport) {
                    sortedEntries.push(Object.assign({}, importMeta, {
                        getReplacement: () => finalImport
                    }));
                }

                sortedEntries.forEach(n => {
                    if(Utils.isIdEmpty(n.id)){
                        return;
                    }
                    source = source.slice(0, n.start) + n.getReplacement(n.id) + source.slice(n.end);
                });

                if (finalImport && !hasImported) {
                    source = finalImport + source;
                }
                if (sortedEntries.length) {
                    Object.keys(TranslationContainer).forEach(language => {
                        if (!options.hasEnglish && language === 'en') {
                            return;
                        }
                        Utils.writeSync(path.resolve(options.target, `${language}.js`), `${Constant.Header}${JSON.stringify(TranslationContainer[language], null, 2)}`);
                    });
                    Utils.writeSync(path.resolve(options.srcTarget, path.relative(options.baseFolder, file)), source);
                }
            } catch (e) {
                console.log(`解析文件失败：${file}`, e);
            }
        });
    });
    if(browser){
        await browser.close();
    }
}