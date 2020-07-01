const fs = require('fs');
const path = require('path');
const Utils = require('./utils');

module.exports = (filepath, content) => {
    // console.log(filepath);
    let lines = content.split('\n');

    const words = {};
    let isStart = false;
    let isEnd = false;
    let isComment = false;
    let currentIsCommentEnd = false;
    lines = lines.map(line => {
        if (currentIsCommentEnd) {
            currentIsCommentEnd = false;
        }
        if (line.indexOf('<template>') !== -1) {
            isStart = true;
        }
        if (line.indexOf('</template>') !== -1) {
            isEnd = true;
        }
        if (!isStart) {
            return line;
        }
        if (isEnd) {
            return line;
        }
        if (line.indexOf('<!--') !== -1) {
            isComment = true;
        }
        if (line.indexOf('-->') !== -1) {
            isComment = false;
            currentIsCommentEnd = true;
        }
        if (isComment) {
            return line;
        }
        if (currentIsCommentEnd) {
            return line;
        }
        const lineWords = line.match(/[\u4e00-\u9fa5，。]+[a-z0-9A-Z]*[\u4e00-\u9fa5，。]+/g);
        if (lineWords && lineWords.length) {
            lineWords.forEach(element => {
                words[element] = true;
            });
            if (lineWords.length === 1) {
                const reg = new RegExp('\\w+="' + lineWords[0]);
                const attrMatch = line.match(reg);
                if (attrMatch && attrMatch[0]) {

                    // console.log('line:', reg, line, attrMatch, line.replace(attrMatch[0], ':' + attrMatch[0]));
                    line = line.replace(attrMatch[0], ':' + attrMatch[0]);
                    words[lineWords[0]] = line;
                }
            }else{
                console.log('greate: ', filepath, lineWords);
            }
        }
        return line;
    });

    if (Object.keys(words).length) {
        return '<templte>\nLabels: {\n' + Object.keys(words).map(w => `'${w}${words[w] === true ? '' : '=' + words[w]}'`).join(',\n') + '\n}\n</templte>\n' + lines.join('\n');
    }
    return content;
}

// module.exports = (filepath, content) => {
//     console.log(filepath);
//     const matchs = content.match(/<template[^>]*>((.*\n)*)<\/template>/);
//     const validContent = matchs && matchs[1];

//     const china = validContent.match(/[\u4e00-\u9fa5]+[a-z0-9A-Z]*[\u4e00-\u9fa5]+/g);
//     if (china && china.length) {
//         const total = china.reduce((total, word)=>{
//             total[word] = true;
//             return total;
//         }, {});
//         return '<templte>\nLabels: {\n' + Object.keys(total).map(w => `'${w}'`).join(',\n') + '\n}\n</templte>\n' + content;
//     }
//     return content;
// }