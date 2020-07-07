const path = require('path');
const fs = require('fs');

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
        if (!duplicateKeys[validId]) {
            duplicateKeys[validId] = 1;
        } else {
            duplicateKeys[validId] += 1;
        }
        validId = `${validId}-${duplicateKeys[validId]}`;
    }
    return validId;
}


module.exports.getUniqueImportId = (id, all) => {
    const duplicateKeys = {};
    let validId = id;
    while (validId in all) {
        if (!duplicateKeys[validId]) {
            duplicateKeys[validId] = 1;
        } else {
            duplicateKeys[validId] += 1;
        }
        validId = `${validId}${duplicateKeys[validId]}`;
    }
    return validId;
}

const getProcessFiles = (folders, excludes) => {
    return folders.reduce((files, folder) => {
        const jsFiles = getJSFileList(path.resolve(process.cwd(), folder));
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
};
module.exports.getProcessFiles = getProcessFiles;