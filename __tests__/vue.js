import path from 'path';
import fs from 'fs';
import parseParam from '~/param';
import vue from '~/vue';
import i18n from '~/main';
import settings from '~/settings';
import traverse from "@babel/traverse";

const babelParser = require("@babel/parser");
const encode = 'UTF8';
const toolPath = '~/locale-tools';
const filePath = 'test/code/vue';
const babelConfig = settings.babelConfig(false);
const IDName = 'Labels';

jest.setTimeout(30000);

const getSourceTemplateCode = (source) => {
    const code = vue.getTemplateContent(source);
    const chinas = code.split('\n').reduce((all, line) => {
        const matches = vue.extractChinease(line);
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
    const code = vue.getVueScriptContent(source);
    const astTree = babelParser.parse(code, babelConfig);

    let hasDataMethod = false;
    let labelKeyLength = 0;
    let hasLabelKey = false;

    traverse(astTree, {
        ExportDefaultDeclaration(_node) {
            const declaration = _node.node.declaration;
            if (declaration.type === 'ObjectExpression') {
                const properties = declaration.properties;
                if (properties) {
                    const dataMethod = properties.find(prop => {
                        return prop.type === 'ObjectMethod' && prop.key && prop.key.type === 'Identifier' && prop.key.name === 'data';
                    });
                    hasDataMethod = !!dataMethod;

                    if (dataMethod && dataMethod.body) {
                        const body = dataMethod.body.body;
                        const returnStatment = body.find(statement => statement.type === 'ReturnStatement');
                        if (returnStatment && returnStatment.argument.type === 'ObjectExpression') {
                            const hasLabels = returnStatment.argument.properties.find(p => p.type === 'ObjectProperty' && p.key.name === IDName);
                            if (hasLabels) {
                                hasLabelKey = true;
                                if (hasLabels.value.type === 'ObjectExpression') {
                                    labelKeyLength = hasLabels.value.properties.length;
                                }
                            }
                        }
                    }
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
        srcCopyFolder: 'dist',
    };

    const parsed = parseParam(pamras);
    const baseFolder = parsed.srcTarget;

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

    it('保留Template内部注释', async () => {
        const after = fs.readFileSync(path.resolve(baseFolder, filePath, 'data-empty.vue'), encode);
        expect(/<!--/.test(after)).toBe(true);
        expect(/-->/.test(after)).toBe(true);
    });

    it('无中文时，无需改变文件', async () => {
        const isExists = fs.existsSync(path.resolve(baseFolder, filePath, 'no-china.vue'));
        expect(isExists).toBe(false);
    });

    it('无Script有中文时', async () => {
        const isExists = fs.existsSync(path.resolve(baseFolder, filePath, 'empty-script.vue'));
        expect(isExists).toBe(false);
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
    });

    it('当export对象只有一个属性，但不包含data方法时，自动增加Labels属性', async () => {
        expectLabelKeyLength('data-no-data-one.vue');
    });

    it('当export对象包含多个属性，但不包含data方法时，自动增加Labels属性', async () => {
        expectLabelKeyLength('data-no-data.vue');
    });

});