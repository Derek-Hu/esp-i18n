const fs = require('fs');
const path = require('path');
const Constant = require('./constant');

module.exports = function loadLocales(languages, baseFolder, supportedLanguages){
    const resources = {};

    if(!languages){
        languages = [];
    }
    if(languages.indexOf('zh')===-1){
        languages.push('zh');
    }
    languages.forEach(language => {
        if((language!=='zh') && !supportedLanguages[language]){
            return;
        }
        try{
            const fileContent = fs.readFileSync(path.resolve(baseFolder, `${language}.js`), 'UTF8');
            resources[language] = JSON.parse(fileContent.replace(Constant.Header, ''));
        }catch(e){}
    });

    if(!resources['zh']){
        resources['zh'] = {};
    }

    return resources;
}