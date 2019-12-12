const i18n = require('esp-i18n');

i18n({
    folders : ['src/angular'],
    // import { translate, Translation } from 'angular-translate';
    localTools : 'angular-translate',
    jsName: 'translate',
    componentName: 'Translation',
    target: 'locale',
    headless: false,
});