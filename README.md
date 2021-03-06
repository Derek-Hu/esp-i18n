扫描指定目录时自动检测中文，将自动生成zh.js、en.js等国际化文件。

使用Babel进行语法分析，并使用百度翻译自动生成国际化id属性；

支持ES6、TS等语法，支持React、Angular(html不会自动翻译)、Vue等JS代码。

### React
源代码: 
```js
import React from 'react';
import ErrorPage from '~/components/error-page';

export default class ErrorPage403 extends React.Component {
  render() {
    return <ErrorPage title="抱歉你没有菜单权限">
        你好
    </ErrorPage>;
  }
}
```

自动修改后: 
```js
import { formatMessage } from '~/localTools';
import React from 'react';
import ErrorPage from '~/components/error-page';

export default class ErrorPage403 extends React.Component {
  render() {
    return <ErrorPage title={formatMessage({id: 'be-sorry-limits-of-authority'})}>
        { formatMessage({id: 'hello'}) }
    </ErrorPage>;
  }
}
```
### Vue
源代码: 
```html
<template>
  <section class="guide-wrap-section">
    <p>抱歉你没有菜单权限</p>
    <input placeholder="你好" />
  </section>
</template>

<script>
export default {
  async mounted() {},
  methods: {
    goToSupplierEnter() {
      this.$router.push({
        name: 'companyEnter',
      });
    },
  },
};
</script>
```

自动修改后: 
```html
<template>
  <section class="guide-wrap-section">
    <p>{{i18n.beSorryLimitsOfAuthority}}</p>
    <input :placeholder="i18n.hello" />
  </section>
</template>

<script>
export default {
  async mounted() {},
  methods: {
    goToSupplierEnter() {
      this.$router.push({
        name: 'companyEnter',
      });
    },
    data(){
      return {
        i18n: {
          beSorryLimitsOfAuthority: formatMessage({id: 'be-sorry-limits-of-authority'}),
          hello: formatMessage({id: 'hello'}),
        }
      }
    }
  },
};
</script>
```
### API

```js
const i18n = require('esp-i18n');

i18n({
    // 扫描目录
    folders : ['src/components', 'src/pages'],
    // 忽略/排除目录，默认会忽略掉[target]参数指定的目录
    excludes: ['src/api'],
    // 自定义工具，生成 import { formatMessage } from '~/localTools';
    // 使用[jsName]自定义工具名称
    localTools : '~/localTools',

    // 是否生成zh.ts，默认生成zh.js文件
    // tsExtension: false,

    // Default Name: formatMessage
    // jsName: 'formatMessage',

    // 需进行翻译的语言，如从中文翻译至英文、泰文等，默认为英文，即['en']
    // translate: ['en', 'th'],

    // 指定zh.js en.js 生成的目录，默认为'src/locale'
    // target: 'src/locale',
    // 是否打开浏览器，可查看自动抓取翻译等效果，若浏览器页面出现卡顿，在此模式下则可人工干预；默认为关闭
    // headless: false,

    // 传递给浏览器参数： https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions 之args参数
    // 如浏览器崩溃，可尝试开启如下参数解决
    // args:  ['--disable-gpu', '--no-sandbox', '--lang=en-US', '--disable-setuid-sandbox', '--disable-dev-shm-usage']

    // 代码为Flow类型，而非Typescript
    // isFlow: true,

    // 指定保存修改后的代码路径，默认为覆盖源文件
    //srcCopyFolder: 'dist',

    // 中文生成到Vue Data函数中，使用到属性名，命名遵循变量定义规则，默认值为'Lables'
    // idName: 'i18n',
})
```

支持中文翻译的语言列表见：[https://github.com/Derek-Hu/esp-i18n/blob/master/src/languages.js](https://github.com/Derek-Hu/esp-i18n/blob/master/src/languages.js)

### 单元测试
单元测试运行生成源代码至`dist`文件夹，并生成测试覆盖率报告至文件夹`converage`
```sh
npm test
```

### 开发体验
查看国际化运行效果，将`test`文件源代码进行国际化，直接覆盖`test`文件夹
```sh
npm run i18n
```
