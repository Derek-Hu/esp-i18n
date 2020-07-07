const fs = require('fs');
const path = require('path');
const Constant = require('./constant');

module.exports = function loadLocales(languages, baseFolder) {
    const resources = {};

    if (!languages || !languages.length) {
        return resources;
    }
    languages.forEach(language => {
        try {
            const fileContent = fs.readFileSync(path.resolve(baseFolder, `${language}.js`), 'UTF8');
            resources[language] = eval(`${fileContent.replace(Constant.Header, 'false? null: ')}`);
        } catch (e) { }

        if (!resources[language]) {
            resources[language] = {};
        }
    });
    return resources;
}