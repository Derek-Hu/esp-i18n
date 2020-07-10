const babelParser = require("@babel/parser");
const settings = require('./settings');
const traverse = require("@babel/traverse").default;
const Utils = require('./utils');

const { asyncForEach } = Utils;
const IDName = 'Labels';

const cammelCase = (id) => {
    if (Utils.isIdEmpty(id)) {
        return id;
    }
    const parts = id.split('-');
    return parts.reduce((total, part, index) => {
        if (index === 0) {
            total.push(part);
            return total;
        }
        total.push(part[0].toUpperCase() + part.substring(1));
        return total;
    }, []).join('');
}
const removeComment = (source) => {
    return source.replace(/<!--[^(<!--)]*-->/g, '');
}
const getTemplateContent = (source) => {
    if (Utils.isIdEmpty(source)) {
        return '';
    }
    source = removeComment(source);
    const matchs = source.match(/<template>((.*\n)*)<\/template>/);
    if (matchs && matchs[1]) {
        return matchs[1];
    }
    return '';

}
const getVueScriptContent = (source) => {
    if (Utils.isIdEmpty(source)) {
        return '';
    }
    source = removeComment(source);
    const matchs = source.match(/<script>((.*\n)*)<\/script>/);
    if (matchs && matchs[1]) {
        return matchs[1];
    }
    return '';
}
const updateModifedScripts = (source, newSource) => {
    const scripts = getVueScriptContent(source);
    return source.replace(scripts, newSource);
}

const parseVueData = (source, i18n) => {
    const PluginOptions = settings.babelConfig(false);
    const astTree = babelParser.parse(source, PluginOptions);
    const actions = [];
    traverse(astTree, {
        ExportDefaultDeclaration(_node) {
            const declaration = _node.node.declaration;
            if (declaration.type === 'ObjectExpression') {
                const properties = declaration.properties;
                if (!properties.length) {
                    actions.push({
                        start: declaration.start,
                        end: declaration.end,
                        isInsert: false,
                        getReplacement: () => `{\n\tdata(){\n\t\treturn {\n\t\t\t ${IDName}: ${JSON.stringify(i18n, null, 2)}\n\t\t\t}\n\t\t}\n\t}`
                    });
                    return;
                }
                const dataMethod = properties.find(prop => {
                    return prop.type === 'ObjectMethod' && prop.key && prop.key.type === 'Identifier' && prop.key.name === 'data';
                });
                if (!dataMethod) {
                    actions.push({
                        start: properties[properties.length - 1].start,
                        end: properties[properties.length - 1].end,
                        isInsert: true,
                        getReplacement: () => `,data(){\nreturn {\n ${IDName}: ${JSON.stringify(i18n, null, 2)}\n}\n}`
                    });
                    return;
                }
                const body = dataMethod.body ? dataMethod.body.body : null;
                if (!body.length) {
                    actions.push({
                        start: dataMethod.body.start,
                        end: dataMethod.body.end,
                        isInsert: false,
                        getReplacement: () => `{\nreturn {\n ${IDName}: ${JSON.stringify(i18n, null, 2)}\n}\n}`
                    });
                    return;
                }
                const returnStatment = body.find(statement => statement.type === 'ReturnStatement');
                if (!returnStatment) {
                    actions.push({
                        start: body[body.length - 1].start,
                        end: body[body.length - 1].end,
                        isInsert: true,
                        getReplacement: () => `\treturn {\n\t\t ${IDName}: ${JSON.stringify(i18n, null, 2)}\n\t\t}`
                    });
                    return;
                }
                if (returnStatment.argument.type !== 'ObjectExpression') {
                    return;
                }
                if (!returnStatment.argument.properties.length) {
                    actions.push({
                        start: returnStatment.argument.start,
                        end: returnStatment.argument.end,
                        isInsert: false,
                        getReplacement: () => `{\n${IDName}: ${JSON.stringify(i18n, null, 2)}\n}`
                    });
                    return;
                }
                const hasLabels = returnStatment.argument.properties.find(p => p.type === 'ObjectProperty' && p.key.name === IDName);
                if (!hasLabels) {
                    actions.push({
                        start: returnStatment.argument.properties[0].start,
                        end: returnStatment.argument.properties[0].end,
                        isInsert: true,
                        getReplacement: () => `\n,${IDName}: ${JSON.stringify(i18n, null, 2)}`
                    });
                    return;
                }
                if (hasLabels.value.type === 'ObjectExpression') {
                    if (!hasLabels.value.properties.length) {
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
                        getReplacement: () => `,${Object.keys(i18n).map(key => `${key}:\`${i18n[key]}\``).join(',\n')}`
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
    };
}

const extractChinease = (val) => {
    return val.match(/\s*([^>{"'}<]*[\u4e00-\u9fa5]+[^<{"'}>]*)\s*/g);
}

const getterExpression = (vid) => {
    if(/^\d/.test(vid)){
        return `${IDName}['${vid}']`;
    }
    return `${IDName}.${vid}`;
}
module.exports = async (translate, filepath, content, options) => {
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
        if (line.indexOf('<template>') !== -1) {
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
        const lineWords = extractChinease(line);

        if (lineWords && lineWords.length) {
            if (lineWords.length === 1) {

                const currentWord = lineWords[0].trim();
                const vid = cammelCase(await translate(currentWord, options));

                const transformedWord = currentWord.split('').map(function (k) { return '\\' + k }).join('');
                let reg = new RegExp('(\\w+=)"' + transformedWord + '"');
                let attrMatch = line.match(reg);
                if (attrMatch && attrMatch[0]) {
                    line = line.replace(attrMatch[0], `:${attrMatch[1]}"${getterExpression(vid)}"`);
                }
                if (!attrMatch) {
                    reg = new RegExp(`(:\\w+=)"'` + transformedWord + `'"`);
                    attrMatch = line.match(reg);
                    if (attrMatch && attrMatch[0]) {
                        line = line.replace(attrMatch[0], `${attrMatch[1]}"${getterExpression(vid)}"`);
                    }
                }
                if (!attrMatch) {
                    reg = new RegExp(`(["'])` + transformedWord + `\\1`);
                    attrMatch = line.match(reg);
                    if (attrMatch && attrMatch[0]) {
                        line = line.replace(attrMatch[0], `${getterExpression(vid)}`);
                    }
                }

                if (!attrMatch) {
                    line = line.replace(currentWord, `{{${getterExpression(vid)}}}`);
                }

                if (labels[vid] !== undefined && labels[vid] !== currentWord) {
                    console.error('出现重复ID' + filepath + ':\n', labels[vid], currentWord);
                }
                labels[vid] = currentWord;
            }
        }
        newLines.push(line);
    });

    const newSource = newLines.join('\n');
    if (Object.keys(labels).length) {
        const scripts = getVueScriptContent(content, filepath);
        const { source: modifiedScripts, actions, isUpdated } = parseVueData(scripts, labels, IDName);
        const modified = updateModifedScripts(newSource, modifiedScripts);
        if (isUpdated) {
            return modified;
        }
        return `<templte>\n${IDName}: {\n` + Object.keys(labels).map(w => `${w}=${labels[w]}`).join(',\n') + '\n}\n</templte>\n' + modified;
    }
    return content;
}

module.exports.getVueScriptContent = getVueScriptContent;

module.exports.extractChinease = extractChinease;

module.exports.getTemplateContent = getTemplateContent;