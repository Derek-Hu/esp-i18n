const translateByRemote = require('./translateByRemote');
const babelParser = require("@babel/parser");
const BabelOption = require('./babel');
const traverse = require("@babel/traverse").default;

const translation = translateByRemote.translate;

const cammelCase = (id) => {
    if (!id) {
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
const getVueScriptContent = (source) => {
    if (!source) {
        return source;
    }
    const matchs = source.match(/<script>((.*\n)*)<\/script>/);
    if (matchs && matchs[1]) {
        return matchs[1];
    }
    return source;
}
const updateModifedScripts = (source, newSource) => {
    const scripts = getVueScriptContent(source);
    return source.replace(scripts, newSource);
}

const parseVueData = (source, i18n, IDName) => {
    const PluginOptions = BabelOption(false);
    const astTree = babelParser.parse(source, PluginOptions);
    const actions = [];
    traverse(astTree, {
        ExportDefaultDeclaration(_node) {
            const declaration = _node.node.declaration;
            if (declaration.type === 'ObjectExpression') {
                const properties = declaration.properties;
                if (properties && properties.length) {
                    const dataMethod = properties.find(prop => {
                        return prop.type === 'ObjectMethod' && prop.key && prop.key.type === 'Identifier' && prop.key.name === 'data';
                    });
                    if (!dataMethod) {
                        actions.push({
                            start: properties[properties.length - 1].start,
                            end: properties[properties.length - 1].end,
                            isInsert: true,
                            getReplacement: () => `data(){return { ${IDName}: ${JSON.stringify(i18n, null, 2)}}},`
                        });
                        return;
                    }
                    const body = dataMethod.body ? dataMethod.body.body : null;

                    const returnStatment = body ? body.find(statement => statement.type === 'ReturnStatement') : null;
                    if (!body.length) {
                        actions.push({
                            start: dataMethod.body.start,
                            end: dataMethod.body.end,
                            isInsert: true,
                            getReplacement: () => `return { ${IDName}: ${JSON.stringify(i18n, null, 2)}}`
                        });
                        return;
                    } else if (!returnStatment) {
                        actions.push({
                            start: body[body.length - 1].start,
                            end: body[body.length - 1].end,
                            isInsert: true,
                            getReplacement: () => `return { ${IDName}: ${JSON.stringify(i18n, null, 2)}}`
                        });
                        return;
                    }
                    if (returnStatment.argument.type === 'ObjectExpression') {
                        if (returnStatment.argument.properties && returnStatment.argument.properties.length) {
                            const hasLabels = returnStatment.argument.properties.find(p => p.type === 'ObjectProperty' && p.key.name === IDName);
                            if (hasLabels) {
                                if (hasLabels.value.type === 'ObjectExpression') {
                                    if (hasLabels.value.properties.length) {
                                        console.log('000')
                                        actions.push({
                                            start: hasLabels.value.properties[0].start,
                                            end: hasLabels.value.properties[0].end,
                                            isInsert: true,
                                            getReplacement: () => `,${Object.keys(i18n).map(key => `${key}:${i18n[key]}, `).join(',\n')}`
                                        });
                                    }
                                }
                            } else {
                                console.log('001')
                                actions.push({
                                    start: returnStatment.argument.properties[0].start,
                                    end: returnStatment.argument.properties[0].end,
                                    isInsert: true,
                                    getReplacement: () => `\n,Labels: ${JSON.stringify(i18n, null, 2)}`
                                });
                            }
                        } else {
                            console.log('002')
                            actions.push({
                                start: returnStatment.argument.start,
                                end: returnStatment.argument.end,
                                isInsert: true,
                                getReplacement: () => `\nLabels: ${JSON.stringify(i18n, null, 2)},`
                            });
                        }
                    }
                }
            }
        },
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
        isUpdated: actions.length
    };
}

const projectIds = {};

module.exports = async (filepath, content, launchOptions) => {
    console.log(filepath);
    let lines = content.split('\n');

    const IDName = 'Labels';

    let isStart = false;
    let isEnd = false;
    let isComment = false;
    let currentIsCommentEnd = false;
    const TranslationContainer = {};
    const duplicateKeys = {};

    const labels = {};
    const newLines = [];
    let processIdx = 0;
    for (line of lines) {

        processIdx++;
        console.log(`${processIdx}/${lines.length}`);

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
            continue;
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
            continue;
        }
        const lineWords = line.match(/[a-z0-9()\sA-Z?]*[\u4e00-\u9fa5，（）？。]+[a-z0-9A-Z]*[\u4e00-\u9fa5，（）？。]+[a-z0-9()\sA-Z?]*/g);

        console.log('lineWords', lineWords);
        if (lineWords && lineWords.length) {
            if (lineWords.length === 1) {
                
                const id = await translation(launchOptions, lineWords[0], 'en', projectIds[lineWords[0]], TranslationContainer, duplicateKeys);
                const vid = cammelCase(id);

                projectIds[lineWords[0]] = vid;

                let reg = new RegExp('(\\w+=)"' + lineWords[0] + '"');
                let attrMatch = line.match(reg);
                if (!attrMatch) {
                    reg = new RegExp(`(:\\w+=)"'` + lineWords[0] + `'"`);
                    attrMatch = line.match(reg);
                }
                if (attrMatch && attrMatch[0]) {
                    line = line.replace(attrMatch[0], `:${attrMatch[1]}="${IDName}.${vid}"`);
                    console.log('attrMatch', line, attrMatch);
                }

                if (!attrMatch) {
                    line = line.replace(lineWords[0], `{{${IDName}.${vid}}}`);
                }

                labels[vid] = lineWords[0];
            }
        }
        newLines.push(line);
    }

    const newSource = newLines.join('\n');
    if (Object.keys(labels).length) {
        const scripts = getVueScriptContent(content);
        const { source: modifiedScripts, isUpdated } = parseVueData(scripts, labels, IDName);
        const modified = updateModifedScripts(newSource, modifiedScripts);
        console.log(modifiedScripts);
        if (isUpdated) {
            return modified;
        }
        return '<templte>\nLabels: {\n' + Object.keys(labels).map(w => `${w}=${labels[w]}`).join(',\n') + '\n}\n</templte>\n' + modified;
    }
    return content;
}