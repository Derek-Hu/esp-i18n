
Scan source code, generate zh_CN and en_US locale file && rewrite source code.

```js
const i18n = require('esp-i18n');

i18n({
    // Folder Scan
    folders : ['src/components', 'src/pages'],
    // import { FormattedMessage, formatMessage } from '~/locale-tools';
    localTools : '~/locale-tools',

    // Default Name: formatMessage
    // jsName: 'formatMessage'

    // Default Name: FormattedMessage
    // componentName: 'FormattedMessage'

    // zh_CN.js en_US.js 生产的目录
    target: 'src/locale',
    // whether open browser to view translation
    // headless: false,

    // Rewrite Source to Folder
    //srcCopyFolder: 'dist',
})
```