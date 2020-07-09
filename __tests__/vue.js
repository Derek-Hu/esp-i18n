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
    return code.split('\n').reduce((all, line) => {
        const matches = vue.extractChinease(line);
        if (matches && matches.length === 1) {
            return all.concat(matches);
        }
        return all;
    }, []);
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

    it('当export data 方法无return语句时，自动增加Labels属性', async () => {
        expectLabelKeyLength('data-no-return.vue');
    });

    it('当export data 方法return语句返回空对象时，自动增加Labels属性', async () => {
        expectLabelKeyLength('data-return-empty-object.vue');
    });

    it('当data方法return对象不包含Labels时，自动增加Labels属性', async () => {
        expectLabelKeyLength('data-return-one-end.vue');
    });

    it('当data方法return对象不包含Labels，末尾无逗号时，自动增加Labels属性', async () => {
        expectLabelKeyLength('data-return-one.vue');
    });

    it('当data方法return对象不包含Labels时，包含多个属性时，自动增加Labels属性', async () => {
        expectLabelKeyLength('data-return-two.vue');
    });

    it('当data方法return对象包含Labels时，自动合并Labels属性', async () => {
        expectLabelKeyLength('data-return-with-already-one.vue');
    });

    it('当data方法return对象包含Labels时，包含注释时，自动合并Labels属性', async () => {
        expectLabelKeyLength('data-return-with-already-oneline.vue');
    });

    it('当Labels存在多个现有Key时', async () => {
        expectLabelKeyLength('data-return-with-already-two.vue');
    });

    it('当Labels为空时', async () => {
        expectLabelKeyLength('data-return-with-already.vue');
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