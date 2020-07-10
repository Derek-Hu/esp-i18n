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
module.exports.isIdEmpty = function (id) {
    return (id === null || id === undefined);
}
module.exports.getJSFileList = getJSFileList;

// 写文件
module.exports.writeSync = function (outputFilePath, content) {
    createFolderIfNotExists(outputFilePath);
    fs.writeFileSync(outputFilePath, content);
}

module.exports.getUniqueId = (id, value, zhLocaleData, duplicateKeys) => {
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
    if(!excludes){
        excludes = [];
    }
    return folders.reduce((files, folder) => {
        const jsFiles = getJSFileList(path.resolve(process.cwd(), folder));
        jsFiles.forEach(file => {
            const isExcludes = excludes.some(exclude => {
                return file.indexOf(exclude) === 0;
            });
            if (!isExcludes) {
                files = files.concat(file);
            }
        });
        return files;
    }, []);
};
module.exports.getProcessFiles = getProcessFiles;

module.exports.loadLocales = function (languages, baseFolder) {
    const resources = {};

    if (!languages || !languages.length) {
        return resources;
    }
    languages.forEach(language => {
        try {
            const fileContent = fs.readFileSync(path.resolve(baseFolder, `${language}.js`), 'UTF8');

            resources[language] = eval(`${fileContent.replace(settings.Header, 'false? null: ')}`);
        } catch (e) { 
        }

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