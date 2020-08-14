const path = require('path');
const fs = require('fs');
const settings = require('./settings');

// 创建文件
function createFolderIfNotExists(outputFilePath) {
    const parent = path.dirname(outputFilePath);
    if (!fs.existsSync(parent)) {
        createFolderIfNotExists(parent);
        fs.mkdirSync(parent);
    }
}

// 获取文件列表
function getJSFileList(root) {
    let res = [];
    let files = fs.readdirSync(root);

    files.forEach(file => {
        const pathname = path.join(root, file);
        const stat = fs.lstatSync(pathname);

        if (!stat.isDirectory() && /\.(js|jsx|ts|tsx|vue)$/.test(pathname)) {
            res.push(pathname);
        } else if (stat.isDirectory()) {
            res = res.concat(getJSFileList(pathname));
        }
    });
    return res;
}

// 是否为中文
module.exports.isChineaseText = function (value) {
    return value && /[\u4e00-\u9fa5？（）。]/.test(value);
}

const isEmpty = function (id) {
    return (id === null || id === undefined);
}

const isJSEmpty = (source) => {
    return isEmpty(source) || source.trim() === '';
};

module.exports.isEmpty = isEmpty;
module.exports.getJSFileList = getJSFileList;

// 写文件
module.exports.writeSync = function (outputFilePath, content) {
    createFolderIfNotExists(outputFilePath);
    fs.writeFileSync(outputFilePath, content);
}

module.exports.getUniqueId = (original, value, zhLocaleData, duplicateKeys) => {
    const id = original.replace(/\-\d+$/, '');
    let validId = id;

    while ((validId in zhLocaleData) && (zhLocaleData[validId] !== value)) {
        if (!duplicateKeys[id]) {
            duplicateKeys[id] = 1;
        } else {
            duplicateKeys[id] += 1;
        }
        validId = `${id}-${duplicateKeys[id]}`;
    }
    zhLocaleData[validId] = value;
    return validId;
}

module.exports.getUniqueImportId = (id, all) => {
    const revert = Object.keys(all).reduce((revert, key) => {
        if (revert[all[key]]) {
            return revert;
        }
        revert[all[key]] = key;
        return revert;
    }, {});

    if (revert[id]) {
        return revert[id];
    }
    const duplicateKeys = {};
    let validId = id;
    while (validId in all) {
        if (!duplicateKeys[id]) {
            duplicateKeys[id] = 1;
        } else {
            duplicateKeys[id] += 1;
        }
        validId = `${id}${duplicateKeys[id]}`;
    }
    return validId;
}

const getProcessFiles = (folders, excludes) => {
    if (!excludes) {
        excludes = [];
    }
    return folders.reduce((files, folder) => {
        const jsFiles = getJSFileList(path.resolve(process.cwd(), folder));
        jsFiles.forEach(file => {
            const isExcludes = excludes.some(exclude => {
                const relativePath = path.relative(exclude, file);
                return !/^\.\./.test(relativePath);
            });
            if (!isExcludes) {
                files = files.concat(file);
            }
        });
        return files;
    }, []);
};
module.exports.getProcessFiles = getProcessFiles;

const jsonCompatiable = (filepath) => {
    try {
        const fileContent = fs.readFileSync(filepath, 'UTF8');
        const value = eval(`${fileContent.replace(settings.Header, 'false? null: ')}`);

        if (Object.prototype.toString.call(value) === '[object Object]') {
            return value;
        }
        return {};
    } catch (e) {
        return {};
    }
}
module.exports.jsonCompatiable = jsonCompatiable;
module.exports.loadLocales = function (languages, baseFolder, isTs) {
    const resources = {};

    if (!languages || !languages.length) {
        return resources;
    }
    languages.forEach(language => {
        resources[language] = jsonCompatiable(path.resolve(baseFolder, `${language}.${isTs ? 'ts' : 'js'}`));
        if (!resources[language]) {
            resources[language] = {};
        }
    });
    return resources;
}

module.exports.asyncForEach = async function (array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}


// const removeComment = (source) => {
//     return source.replace(/<!--[^(<!--)]*-->/g, '');
// };
const placeholder = '____VUE_PLACEHOLDER____';

// source可能已更新，比如template
const getVueScriptContent = (source) => {
    if (isJSEmpty(source)) {
        return {};
    }
    const matchs = source.match(/(<script[^>]*>)((.*\n)*)(<\/script>)/);
    if (matchs) {
        const scripts = matchs[2];
        return {
            scripts,
            placeholder,
            wrapper: source.replace(scripts, placeholder),
        };
    }
    return {
        scripts: '',
        placeholder: '',
        wrapper: source,
    };
};

const extractChinease = (val) => {
    if (isEmpty(val)) {
        return val;
    }
    return val.match(/\s*([^>{"`'}<]*[\u4e00-\u9fa5]+[^<{"`'}>]*)\s*/g);
}

module.exports.getVueScriptContent = getVueScriptContent;

module.exports.extractChinease = extractChinease;

module.exports.isJSEmpty = isJSEmpty;