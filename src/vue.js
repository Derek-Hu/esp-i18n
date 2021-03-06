const babelParser = require("@babel/parser");
const settings = require('./settings');
const traverse = require("@babel/traverse").default;
const Utils = require('./utils');
const path = require('path');

const { asyncForEach } = Utils;

const cammelCase = (id) => {
    if (Utils.isEmpty(id)) {
        return id;
    }
    const parts = id.split('-');
    return parts.reduce((total, part, index) => {
        if (index === 0) {
            total.push(part);
            return total;
        }
        if (part === '') {
            return total;
        }
        total.push(part[0].toUpperCase() + part.substring(1));
        return total;
    }, []).join('');
}

const parseVueData = (source, i18n, idLabel) => {
    const PluginOptions = settings.babelConfig(false);
    const astTree = babelParser.parse(source, PluginOptions);
    const actions = [];
    let suspect = false;
    traverse(astTree, {
        ExportDefaultDeclaration(_node) {
            const declaration = _node.node.declaration;
            if (declaration.type === 'ObjectExpression') {
                const properties = declaration.properties;
                if (!properties || !properties.length) {
                    actions.push({
                        start: declaration.start,
                        end: declaration.end,
                        isInsert: false,
                        getReplacement: () => `{\n\tdata(){\n\t\treturn {\n\t\t\t ${idLabel}: ${JSON.stringify(i18n, null, 2)}\n\t\t\t}\n\t\t}\n\t}`
                    });
                    return;
                }
                let isArrowDirect = false;
                let body;
                let bodyParent;
                let dataMethod = properties.find(prop => {
                    return prop.type === 'ObjectMethod' && prop.key && prop.key.type === 'Identifier' && prop.key.name === 'data';
                });
                if (dataMethod) {
                    body = dataMethod.body ? dataMethod.body.body : null;
                    bodyParent = dataMethod.body;
                } else {
                    dataMethod = properties.find(prop => {
                        return prop.type === 'ObjectProperty' && prop.key && prop.key.type === 'Identifier' && prop.key.name === 'data' && prop.value.type === 'ArrowFunctionExpression';
                    });
                    if (dataMethod) {
                        if (dataMethod.value.body.type === 'BlockStatement') {
                            body = dataMethod.value.body.body;
                            bodyParent = dataMethod.value.body;
                        } else {
                            isArrowDirect = true;
                        }
                    }
                }
                if (!dataMethod) {
                    actions.push({
                        start: properties[properties.length - 1].start,
                        end: properties[properties.length - 1].end,
                        isInsert: true,
                        getReplacement: () => `,\n\tdata(){\n\t\treturn {\n\t\t\t${idLabel}: ${JSON.stringify(i18n, null, 2)}\n\t\t}\n\t}`
                    });
                    return;
                }
                let returnStatment;
                if (!isArrowDirect) {
                    if (!body || !body.length) {
                        actions.push({
                            start: bodyParent.start,
                            end: bodyParent.end,
                            isInsert: false,
                            getReplacement: () => `{\nreturn {\n ${idLabel}: ${JSON.stringify(i18n, null, 2)}\n}\n}`
                        });
                        return;
                    }
                    returnStatment = body.find(statement => statement.type === 'ReturnStatement');
                    if (!returnStatment) {
                        actions.push({
                            start: body[body.length - 1].start,
                            end: body[body.length - 1].end,
                            isInsert: true,
                            getReplacement: () => `\n\treturn {\n\t\t ${idLabel}: ${JSON.stringify(i18n, null, 2)}\n\t\t}`
                        });
                        return;
                    }
                }
                const objectExpression = isArrowDirect ? dataMethod.value.body : returnStatment.argument;
                if (objectExpression.type !== 'ObjectExpression') {
                    if (source.indexOf(idLabel) !== -1) {
                        suspect = true;
                    }
                    actions.push({
                        start: objectExpression.start,
                        end: objectExpression.end,
                        isInsert: false,
                        getReplacement: () => `({
                            ...(${source.slice(objectExpression.start, objectExpression.end)}),
                            ${idLabel}: ${JSON.stringify(i18n, null, 2)}
                        })`
                    });
                    return;
                }
                if (!objectExpression.properties || !objectExpression.properties.length) {
                    actions.push({
                        start: objectExpression.start,
                        end: objectExpression.end,
                        isInsert: false,
                        getReplacement: () => `{\n\t\t\t${idLabel}: ${JSON.stringify(i18n, null, 2)}\n\t\t\t}`
                    });
                    return;
                }
                const hasLabels = objectExpression.properties.find(p => p.type === 'ObjectProperty' && p.key.name === idLabel);
                if (!hasLabels) {
                    actions.push({
                        start: objectExpression.properties[0].start,
                        end: objectExpression.properties[0].end,
                        isInsert: true,
                        getReplacement: () => `,\n\t\t\t${idLabel}: ${JSON.stringify(i18n, null, 2)}`
                    });
                    return;
                }
                if (hasLabels.value.type === 'ObjectExpression') {
                    if (!hasLabels.value.properties || !hasLabels.value.properties.length) {
                        actions.push({
                            start: hasLabels.value.start,
                            end: hasLabels.value.end,
                            getReplacement: () => `{\n${Object.keys(i18n).map(key => `\t\t${key}:\`${i18n[key]}\``).join(',\n')}\n\t}`
                        });
                        return;
                    }
                    actions.push({
                        start: hasLabels.value.properties[0].start,
                        end: hasLabels.value.properties[0].end,
                        isInsert: true,
                        getReplacement: () => `,\n${Object.keys(i18n).map(key => `${key}:\`${i18n[key]}\``).join(',\n')}`
                    });
                }
            }
        }
    });

    const sortedEntries = actions.sort((a, b) => { return b.end - a.end });

    sortedEntries.forEach(n => {
        if (n.isInsert) {
            source = source.slice(0, n.end) + n.getReplacement() + source.slice(n.end);
        } else {
            source = source.slice(0, n.start) + n.getReplacement() + source.slice(n.end);
        }
    });

    return {
        source,
        isUpdated: actions.length,
        actions,
        suspect,
    };
}

const getterExpression = (vid, idName) => {
    if (/^[a-z_A-Z]+[\da-z_A-Z]*$/.test(vid)) {
        return `${idName}.${vid}`;
    }
    return `${idName}['${vid}']`;
}

module.exports = async (translate, filepath, content, errorVueFiles, suspectVueFiles, IDName) => {
    let lines = content.split('\n');

    let isStart = false;
    let isEnd = false;
    let isComment = false;
    let currentIsCommentEnd = false;

    const labels = {};
    const newLines = [];
    await asyncForEach(lines, async line => {

        if (currentIsCommentEnd) {
            currentIsCommentEnd = false;
        }
        if (/^\s*<template[^>]*>/.test(line)) {
            isStart = true;
        }
        if (line.indexOf('</template>') !== -1) {
            isEnd = true;
        }
        if (!isStart || isEnd) {
            newLines.push(line);
            return;
        }
        if (line.indexOf('<!--') !== -1) {
            isComment = true;
        }
        if (line.indexOf('-->') !== -1) {
            isComment = false;
            currentIsCommentEnd = true;
        }
        if (isComment || currentIsCommentEnd) {
            newLines.push(line);
            return;
        }
        const lineWords = Utils.extractChinease(line);
        if (lineWords && lineWords.length) {
            await asyncForEach(lineWords, async matchWordInfo => {
                // const vid = cammelCase(await translate(matchWordInfo));
                // if (Utils.isEmpty(vid)) {
                //     return;
                // }
                const transformedWord = matchWordInfo.split('').map(function (k) {
                    if (/[.?()[\]*+={}/\\]/.test(k)) {
                        return '\\' + k
                    }
                    return k;
                }).join('');
                let replaceAction = null;

                let reg = new RegExp('(\\w+\\s*=\\s*)(["\'])' + transformedWord + '\\2');
                let attrMatch = line.match(reg);
                if (attrMatch && attrMatch[0]) {
                    replaceAction = (vid) => line.replace(attrMatch[0], `:${attrMatch[1]}"${getterExpression(vid, IDName)}"`);
                }
                if (!attrMatch) {
                    reg = new RegExp(`(["'\`])${transformedWord}\\1`);
                    attrMatch = line.match(reg);
                    if (attrMatch && attrMatch[0]) {
                        replaceAction = (vid) => line.replace(reg, getterExpression(vid, IDName));
                    }
                }

                let currentWord = matchWordInfo;
                if (!attrMatch) {
                    currentWord = matchWordInfo.trim();
                    replaceAction = (vid) => line.replace(currentWord, `{{${getterExpression(vid, IDName)}}}`);
                }

                const vid = cammelCase(await translate(currentWord));
                if (Utils.isEmpty(vid)) {
                    return;
                }
                line = replaceAction(vid);
                labels[vid] = currentWord;
            });
        }
        newLines.push(line);
    });

    const newSource = newLines.join('\n');
    if (Object.keys(labels).length) {
        const structure = Utils.getVueScriptContent(newSource);
        const { scripts } = structure;
        const shortPath = path.relative(process.cwd(), filepath);
        let syntaxError = false;
        if (!Utils.isJSEmpty(scripts)) {
            try {
                const { source: modifiedScripts, suspect, isUpdated } = parseVueData(scripts, labels, IDName);
                if (isUpdated) {
                    if (suspect) {
                        suspectVueFiles.push(shortPath);
                    }
                    return {
                        ...structure,
                        scripts: modifiedScripts,
                    }
                }
            } catch (e) {
                syntaxError = true;
            }
        }
        if(syntaxError){
            errorVueFiles.push(shortPath);
        }
        const addLines = `const ${IDName} = {\n` + Object.keys(labels).map(w => `\t${w}:'${labels[w]}'`).join(',\n') + '\n};\n';
        return {
            ...structure,
            wrapper: addLines + structure.wrapper,
        }
    }
    return Utils.getVueScriptContent(newSource);
}
