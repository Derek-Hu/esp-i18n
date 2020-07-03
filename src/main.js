const fs = require('fs');
const path = require('path');
const traverse = require("@babel/traverse").default;
const babelParser = require("@babel/parser");
const Utils = require('./utils');
const LanguageMapping = require('./languages');
const Constant = require('./constant');
const loadLocales = require('./load');
const BabelOption = require('./babel');
const paramParser = require('./param');
const translateByRemote = require('./translateByRemote');
const ProgressBar = require('progress');

const translation = translateByRemote.translate;

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

const getProcessFiles = (folders, excludes) => {
    return folders.reduce((files, folder) => {
        const jsFiles = Utils.getJSFileList(path.resolve(process.cwd(), folder));
        jsFiles.forEach(file => {
            const isExcludes = excludes.some(exclude => {
                return file.indexOf(exclude) === 0;
            });
            if (!isExcludes) {
                files = files.concat(jsFiles);
            }
        });
        return files;
    }, []);
}
module.exports = async (params) => {

    const options = paramParser(params);
    const translateLanguages = params.translate && params.translate.length ? params.translate : ['en'];
    const Types = options.types;
    const PluginOptions = BabelOption(options.isFlow);

    const launchOptions = {
        headless: params.headless,
        args: params.args,
    }

    const TranslationContainer = loadLocales(translateLanguages, options.target, LanguageMapping);

    const chinaValueKeyMapping = Object.keys(TranslationContainer['zh']).reduce((all, chinaId) => {
        all[TranslationContainer['zh'][chinaId]] = chinaId;
        return all;
    }, {});

    const duplicateKeys = {};

    async function getId(value) {
        const id = await translation(launchOptions, value, 'en', null, TranslationContainer, duplicateKeys);
        if (Utils.isIdEmpty(id)) {
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
            await translation(launchOptions, value, code, id, TranslationContainer, duplicateKeys);
        })
        return id;
    }

    const fileNeedProcessing = getProcessFiles(options.folders, options.excludes);

    const progressBar = new ProgressBar('国际化:current/:total个文件 [:bar] :percent 耗时:elapsed秒 正在处理文件：:file', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: fileNeedProcessing.length,
    });
    await asyncForEach(fileNeedProcessing, async file => {
        const entries = [];
        const fileContent = fs.readFileSync(file, 'UTF8');
        progressBar.tick({
            file: file,
        });

        const [jsContent, wrapper, placeholder] = options.getSource ? await options.getSource(file, fileContent) : [fileContent, null];

        let source = jsContent;
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
                TemplateLiteral(_node) {
                    const node = _node.node;
                    if (!node.quasis || !node.quasis.length) {
                        return;
                    }
                    const funcName = nameMapping[Types.jsFunc] || Types.jsFunc;

                    node.quasis.forEach((quasi) => {
                        const value = quasi.value.raw;
                        if (!Utils.isChineaseText(value)) {
                            return;
                        }
                        entries.push({
                            isComponent: false,
                            start: quasi.start,
                            end: quasi.end,
                            value: quasi.value.raw,
                            file: file,
                            getReplacement: (id) => `\${${funcName}({id: '${id}'})}`
                        });
                    });
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

            if (!entries.length) {
                return;
            }

            await asyncForEach(entries, async (entry) => {
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
                if (Utils.isIdEmpty(n.id)) {
                    return;
                }
                source = source.slice(0, n.start) + n.getReplacement(n.id) + source.slice(n.end);
            });

            if (finalImport && !hasImported) {
                source = finalImport + source;
            }

            source = wrapper && placeholder ? wrapper.replace(placeholder, source) : source;

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
            console.error(`解析文件失败：${file}`, e);
            console.log(jsContent);
        }
    });
    const browser = translateByRemote.getBrowserInstance();
    if (browser) {
        await browser.close();
    }
}