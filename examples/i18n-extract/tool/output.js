const i18n = require('esp-i18n');

i18n({
    folders : ['src/react', 'src/typescript'],
    // import { formatMessage, FormattedMessage } from 'umi/locale';
    localTools : 'umi/locale',
    target: 'locale',
    srcCopyFolder: 'dist'
})