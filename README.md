
```js
const i18n = require('esp-i18n');

i18n({
    // 需要扫描的代码
    folders : ['src'],
    // 工具路径，如生产代码为：import { FormattedMessage } from '~/locale-tools';
    localTools : '~/locale-tools',
    // zh_CN.js en_US.js 生产的目录
    target: 'src/locale',
    // 打开浏览器，查看抓取的效果
    // headless: false
})
```