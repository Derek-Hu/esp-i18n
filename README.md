扫描指定目录时自动检测中文，将自动生成zh_CN.js、en_US.js等国际化文件。

使用Babel进行语法分析，并使用百度翻译自动生成国际化id属性；

支持ES6、TS等语法

Example: https://github.com/Derek-Hu/esp-i18n/tree/master/examples/i18n-extract

```js
const i18n = require('esp-i18n');

i18n({
    // 扫描目录
    folders : ['src/components', 'src/pages'],
    // 忽略/排除目录，默认会忽略掉[target]参数指定的目录
    excludes: ['src/api'],
    // 自定义工具，如：import { FormattedMessage, formatMessage } from '~/locale-tools';
    // 使用[jsName]和[componentName]自定义工具名称
    // 使用[localTools]指定引用路径
    localTools : '~/locale-tools',

    // Default Name: formatMessage
    // jsName: 'formatMessage',

    // Default Name: FormattedMessage
    // componentName: 'FormattedMessage',

    // 指定zh_CN.js en_US.js 生成的目录
    target: 'src/locale',
    // 是否打开浏览器，可查看自动抓取翻译等效果，若浏览器页面出现卡顿，在此模式下则可人工干预
    // headless: false,

    // 指定保存修改后的代码路径，默认为覆盖源文件
    //srcCopyFolder: 'dist',
})
```

源代码: 
```js
import React from 'react';
import ErrorPage from '~/components/error-page';
import Controller from 'Controller';

@Controller('/403', {
  title: '访问拒绝',
})
export default class ErrorPage403 extends React.Component {
  render() {
    return <ErrorPage title="抱歉你没有菜单权限">
      <p>请联系管理员</p>
    </ErrorPage>;
  }
}
```

自动生成代码: 
```js
import { formatMessage, FormattedMessage } from '~/locale-tools';
import React from 'react';
import ErrorPage from '~/components/error-page';
import Controller from '~/Controller';

@Controller('/403', {
  title: formatMessage({id: 'access-denied'}),
})
export default class ErrorPage403 extends React.Component {
  render() {
    return <ErrorPage title={formatMessage({id: 'be-sorry-limits-of-authority'})}>
      <p><FormattedMessage id="please-contact-the-administrator" /></p>
    </ErrorPage>;
  }
}
```