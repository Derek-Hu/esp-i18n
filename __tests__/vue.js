import path from 'path';
import fs from 'fs';
import parseParam from '~/param';
import i18n from '~/main';
import settings from '~/settings';
import traverse from "@babel/traverse";
import Utils from '~/utils';

const babelParser = require("@babel/parser");
const encode = 'UTF8';
const toolPath = '~/locale-tools';
const filePath = 'test/code/vue';
const babelConfig = settings.babelConfig(false);
const IDName = 'Labels';
const parseLocalJson = (source) => {
    return JSON.parse(source.replace('export default ', ''));
}

jest.setTimeout(30000);

const removeComment = (source) => {
    return source.replace(/<!--[^(<!--)]*-->/g, '');
};

const getTemplateContent = (source) => {
    if (Utils.isEmpty(source)) {
        return '';
    }
    source = removeComment(source);
    const matchs = source.match(/<template>((.*\n)*)<\/template>/);
    if (matchs && matchs[1]) {
        return matchs[1];
    }
    return '';

}

const getSourceTemplateCode = (source) => {
    const code = getTemplateContent(source);
    const chinas = code.split('\n').reduce((all, line) => {
        const matches = Utils.extractChinease(line);
        if (matches && matches.length) {
            matches.forEach(m => {
                all[m] = true;
            });
        }
        return all;
    }, {});
    return Object.keys(chinas);
}
const getOriginalKeys = (source) => {
    const { scripts } = Utils.getVueScriptContent(source);
    const astTree = babelParser.parse(scripts, babelConfig);

    let hasDataMethod = false;
    let labelKeyLength = 0;
    let hasLabelKey = false;

    traverse(astTree, {
        ExportDefaultDeclaration(_node) {
            const declaration = _node.node.declaration;
            if (declaration.type === 'ObjectExpression') {
                const properties = declaration.properties;
                if (properties) {
                    let dataMethod = properties.find(prop => {
                        return prop.type === 'ObjectMethod' && prop.key && prop.key.type === 'Identifier' && prop.key.name === 'data';
                    });
                    if (!dataMethod) {
                        dataMethod = properties.find(prop => {
                            return prop.type === 'ObjectProperty' && prop.key && prop.key.type === 'Identifier' && prop.key.name === 'data' && prop.value.type === 'ArrowFunctionExpression';
                        });
                    }
                    hasDataMethod = !!dataMethod;
                }
            }
        },
        ObjectProperty(_node) {
            const node = _node.node;
            if (node.key.name === IDName) {
                hasLabelKey = true;
                if (node.value.properties) {
                    labelKeyLength = node.value.properties.length;
                }
            }
        }
    });
    return {
        hasDataMethod,
        hasLabelKey,
        labelKeyLength
    };
}
const findDataMethod = (after, filename) => {

    const before = fs.readFileSync(path.resolve(process.cwd(), filePath, filename), encode);
    const chinaSize = getSourceTemplateCode(before);
    const beforeMeta = getOriginalKeys(before);

    return {
        ...getOriginalKeys(after),
        totalSize: chinaSize.length + beforeMeta.labelKeyLength,
    }
}
describe('解析百度翻译页面结果', () => {
    const pamras = {
        // 扫描目录
        folders: [filePath],
        localTools: toolPath,
        target: 'test/locale',
        translate: ['th'],
        srcCopyFolder: 'dist',
    };

    const parsed = parseParam(pamras);
    const { srcTarget: baseFolder, target } = parsed;

    beforeAll(async () => {
        await i18n(pamras);
    });

    const expectLabelKeyLength = (filename) => {
        const after = fs.readFileSync(path.resolve(baseFolder, filePath, filename), encode);
        const {
            hasDataMethod,
            hasLabelKey,
            totalSize,
            labelKeyLength,
        } = findDataMethod(after, filename);

        expect(hasDataMethod).toBe(true);
        expect(hasLabelKey).toBe(true);
        expect(labelKeyLength).toBe(totalSize);
    }
    it('当export data 方法且Body为空时，自动增加Labels属性', async () => {
        expectLabelKeyLength('data-empty.vue');
    });

    it('正确处理vue属性', async () => {
        const after = fs.readFileSync(path.resolve(baseFolder, filePath, 'data-empty.vue'), encode);
        const correct = fs.readFileSync(path.resolve(process.cwd(), 'test/result', 'data-empty.vue'), encode);
        expect(after).toBe(correct);
    });

    it('JS语言报错时，给提示', async () => {
        [
            'syntax-error/no-china-html-js-syntax.vue',
            'syntax-error/no-china-script-and-js-syntax-error.vue',
            'syntax-error/syntax-error.vue',
            'syntax-error/syntax-export.vue'
        ].forEach(sub => {
            const isExists = fs.existsSync(path.resolve(baseFolder, filePath, sub));
            expect(isExists).toBe(false);
        })
    });

    it('保留Template内部注释', async () => {
        const after = fs.readFileSync(path.resolve(baseFolder, filePath, 'data-empty.vue'), encode);
        expect(/<!--/.test(after)).toBe(true);
        expect(/-->/.test(after)).toBe(true);
    });

    it('无中文时，无需改变文件', async () => {
        const isExists = fs.existsSync(path.resolve(baseFolder, filePath, 'no-china.vue'));
        expect(isExists).toBe(false);
    });

    it('只有template,且template包含中文', async () => {
        const after = fs.readFileSync(path.resolve(baseFolder, filePath, 'empty-script.vue'), encode);
        expect(after.indexOf('const Labels = {') === 0).toBe(true);
    });

    it('template包含中文，script不包含中文', async () => {
        const after = fs.readFileSync(path.resolve(baseFolder, filePath, 'data-no-export.vue'), encode);
        expect(after.indexOf('const Labels = {') === 0).toBe(true);
    });

    it('无Template时，无中文时', async () => {
        const isExists = fs.existsSync(path.resolve(baseFolder, filePath, 'empty-template.vue'));
        expect(isExists).toBe(false);
    });

    it('仅Script中有中文时，无需增加Labels', async () => {
        const after = fs.readFileSync(path.resolve(baseFolder, filePath, 'no-china-template.vue'), encode);
        const {
            hasLabelKey,
            labelKeyLength,
        } = getOriginalKeys(after);

        expect(labelKeyLength).toBe(0);
        expect(hasLabelKey).toBe(false);
    });

    it('当export data 方法无return语句时，自动增加Labels属性', async () => {
        expectLabelKeyLength('data-no-return.vue');
    });

    it('当export data 方法return语句返回空对象时，自动增加Labels属性', async () => {
        expectLabelKeyLength('return/data-return-empty-object.vue');
    });

    it('当data方法return对象不包含Labels时，自动增加Labels属性', async () => {
        expectLabelKeyLength('return/data-return-one-end.vue');
    });

    it('当data方法return对象不包含Labels，末尾无逗号时，自动增加Labels属性', async () => {
        expectLabelKeyLength('return/data-return-one.vue');
    });

    it('当data方法return对象不包含Labels时，包含多个属性时，自动增加Labels属性', async () => {
        expectLabelKeyLength('return/data-return-two.vue');
    });

    it('当data方法return对象包含Labels时，自动合并Labels属性', async () => {
        expectLabelKeyLength('return/data-return-with-already-one.vue');
    });

    it('当data方法return对象包含Labels时，包含注释时，自动合并Labels属性', async () => {
        expectLabelKeyLength('return/data-return-with-already-oneline.vue');
    });

    it('当Labels存在多个现有Key时', async () => {
        expectLabelKeyLength('return/data-return-with-already-two.vue');
    });

    it('当Labels为空时', async () => {
        expectLabelKeyLength('return/data-return-with-already.vue');
    });

    it('当export default 空对象时，自动增加Labels属性', async () => {
        expectLabelKeyLength('data-no-data-default.vue');
        const zh = parseLocalJson(fs.readFileSync(path.resolve(target, 'zh.js'), encode));
        // 正确处理空白
        expect(zh['well-1']).toBe('好的');

        const after = fs.readFileSync(path.resolve(baseFolder, filePath, 'data-no-data-default.vue'), encode);
        const correct = fs.readFileSync(path.resolve(process.cwd(), 'test/result', 'data-no-data-default.vue'), encode);

        expect(after).toBe(correct);

    });

    it('当export对象只有一个属性，但不包含data方法时，自动增加Labels属性', async () => {
        expectLabelKeyLength('data-no-data-one.vue');
    });

    it('当export对象包含多个属性，但不包含data方法时，自动增加Labels属性', async () => {
        expectLabelKeyLength('data-no-data.vue');
    });

    it('data箭头函数', async () => {
        expectLabelKeyLength('data-arrow/data-empty.vue');
    });

    it('data箭头函数 未使用return', async () => {
        expectLabelKeyLength('data-arrow/data-no-return.vue');
    });

    it('data箭头函数 直接return', async () => {
        expectLabelKeyLength('data-arrow/data-return-direct.vue');
    });

    it('data箭头函数 直接return包括Labels', async () => {
        expectLabelKeyLength('data-arrow/data-return-direct-other.vue');
    });

    it('data箭头函数 return其他函数', async () => {
        expectLabelKeyLength('data-arrow/data-return-one.vue');
    });

    it('data箭头函数 return包括Labels', async () => {
        expectLabelKeyLength('data-arrow/data-return-with-already-one.vue');
    });

    it('data箭头函数', async () => {
        expectLabelKeyLength('data-arrow/data-empty-redirect.vue');
    });

    it('data return 非对象写法call', async () => {
        expectLabelKeyLength('data-arrow/data-return-call.vue');
    });

    it('data return 非对象写法...spread', async () => {
        expectLabelKeyLength('data-arrow/data-return-spread.vue');

    });

    it('data return 非对象写法 variable', async () => {
        expectLabelKeyLength('data-arrow/data-return-variable.vue');
    });

    it('data return 非对象写法call', async () => {
        expectLabelKeyLength('return/data-return-call.vue');
    });

    it('data return 非对象写法...spread', async () => {
        expectLabelKeyLength('return/data-return-spread.vue');

    });

    it('data return 非对象写法 variable', async () => {
        expectLabelKeyLength('return/data-return-variable.vue');
    });

});