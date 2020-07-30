1. Angular TS 报错
2. locale文件Key不一致，代码无中文时，没有同步
3. babelrc位置
4. formatMessage移除参数id, importName与js不一样支持
```js
import { TranslateService, TranslateModule, TranslateLoader } from '@ngx-translate/core';
this.translate.instant('wrong-most-after-end-not-supported')
```
