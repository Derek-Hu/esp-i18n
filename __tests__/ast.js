import path from 'path';
import fs from 'fs';
import i18n from '~/main';
import parseParam from '~/param';

const toolPath = '~/locale-tools';
const encode = 'UTF8';
const parseLocalJson = (source) => {
    return JSON.parse(source.replace('export default ', ''));
}
jest.setTimeout(30000);

describe('解析百度翻译页面结果', () => {
    const pamras = {
        // 扫描目录
        folders: ['test/code/ast', 
        // 'test/code/remote', 
        'test/result'],
        // excludes: ['test/code/vue', 'test/code/placeholder', 'test/code/translate', 'test/locale-script'],
        localTools: toolPath,
        headless: false,
        translate: ['th'],
        target: 'test/locale',
        srcCopyFolder: 'dist',
    };

    const parsed = parseParam(pamras);
    const baseFolder = parsed.srcTarget;

    beforeAll(async () => {
        await i18n(pamras);
    });

    it('支持 import {formatMessage as fm} from --> fm({id})', async () => {
        const code = fs.readFileSync(path.resolve(baseFolder, 'test/code/ast', 'import-already.js'), 'UTF8');
        const isExists = code.indexOf('fm(') !== -1;
        expect(isExists).toBe(true);
    });

    it('对象属性动态化[fm]', async () => {
        const code = fs.readFileSync(path.resolve(baseFolder, 'test/code/ast', 'import-already.js'), 'UTF8');
        const isExists = code.indexOf(`[fm({id: 'chinese'})]:`) !== -1;
        expect(isExists).toBe(true);
    });

    it('支持 import defaultName from "~/path"', async () => {
        const code = fs.readFileSync(path.resolve(baseFolder, 'test/code/ast', 'import-chinease.js'), 'UTF8');
        const isExists = code.indexOf('import { formatMessage } from ') !== -1;
        expect(isExists).toBe(true);

        const call = code.indexOf('formatMessage(') !== -1;
        expect(call).toBe(true);
    });

    it('支持 import "~/path"', async () => {
        const code = fs.readFileSync(path.resolve(baseFolder, 'test/code/ast', 'import-empty-chinease.js'), 'UTF8');
        const isExists = code.indexOf('import { formatMessage } from ') !== -1;
        expect(isExists).toBe(true);

        const call = code.indexOf('formatMessage(') !== -1;
        expect(call).toBe(true);
    });

    it('支持 JSX', async () => {
        const code = fs.readFileSync(path.resolve(baseFolder, 'test/code/ast', 'import-empty-jsx.js'), 'UTF8');
        const isExists = code.indexOf('import { formatMessage } from ') !== -1;
        expect(isExists).toBe(true);

        const call = code.indexOf('formatMessage(') !== -1;
        expect(call).toBe(true);
    });

    it('文件内容无中文不需要转化处理', async () => {
        const isExists = fs.existsSync(path.resolve(baseFolder, 'test/code/ast', 'import-empty.js'));
        expect(isExists).toBe(false);
    });

    it('文件语法解析失败，无需转化', async () => {
        const isExists = fs.existsSync(path.resolve(baseFolder, 'test/code/ast', 'syntax-error.js'));
        expect(isExists).toBe(false);
    });

    it('自动添加import', async () => {
        const code = fs.readFileSync(path.resolve(baseFolder, 'test/code/ast', 'no-import.js'), 'UTF8');
        const isExists = code.indexOf('import { formatMessage } from ') !== -1;
        expect(isExists).toBe(true);

        const call = code.indexOf('formatMessage(') !== -1;
        expect(call).toBe(true);
    });

    it('同一文件多次引用，保留原有代码', async () => {
        const code = fs.readFileSync(path.resolve(baseFolder, 'test/code/ast', 'import-multiple-default-as.js'), 'UTF8');
        const isToolExists = code.indexOf(`import Tools from '${toolPath}'`) !== -1;
        const isLocalesExists = code.indexOf(`import Locales from '${toolPath}'`) !== -1;
        const isExists = code.indexOf(`import { another as ano, formatMessage } from '${toolPath}'`) !== -1;
        expect(isToolExists).toBe(true);
        expect(isLocalesExists).toBe(true);
        expect(isExists).toBe(true);

        const call = code.indexOf('formatMessage(') !== -1;
        expect(call).toBe(true);
    });

    it('同一文件多行部分引用，合并部分引用为一行', async () => {
        const code = fs.readFileSync(path.resolve(baseFolder, 'test/code/ast', 'import-multiple-default-rename.js'), 'UTF8');
        const isOneline = code.indexOf(`import { another, formatMessage } from '${toolPath}'`) !== -1;
        expect(isOneline).toBe(true);
    });

    it('同一属性使用as多次引用，as后与需引入属性名冲突', async () => {
        const code = fs.readFileSync(path.resolve(baseFolder, 'test/code/ast', 'import-multiple-duplicate.js'), 'UTF8');
        const another = code.indexOf(`another as formatMessage`) !== -1;
        const formatMessage1 = code.indexOf(`formatMessage1`) !== -1;
        const anotherAs = code.indexOf(`another as formatMessage2`) !== -1;
        const formatMessage = code.indexOf(`formatMessage as formatMessage3`) !== -1;
        expect(another).toBe(true);
        expect(formatMessage1).toBe(true);
        expect(anotherAs).toBe(true);
        expect(formatMessage).toBe(true);

        const call = code.indexOf('formatMessage3(') !== -1;
        expect(call).toBe(true);
    });

    it('import "path" 与 import { fs } from "path"合并', async () => {
        const code = fs.readFileSync(path.resolve(baseFolder, 'test/code/ast', 'import-multiple-func.js'), 'UTF8');
        const isOneline = code.indexOf(`import { another, formatMessage } from '${toolPath}'`) !== -1;
        const merged = code.indexOf(`import '${toolPath}'`) === -1;
        expect(merged).toBe(true);
        expect(isOneline).toBe(true);

        const call = code.indexOf('formatMessage(') !== -1;
        expect(call).toBe(true);
    });

    const remoteParams = {
        folders: ['test/code/remote'],
        localTools: toolPath,
        translate: ['th'],
        target: 'dist/abc/locale2',
        srcCopyFolder: 'dist',
    };
    const parsedRemote = parseParam(remoteParams);

    it('使用百度翻译，生成zh，en文件', async () => {

        // await i18n(remoteParams);
        // const zhExists = fs.existsSync(path.resolve(parsedRemote.target, 'zh.js'));
        // const enExists = fs.existsSync(path.resolve(parsedRemote.target, 'en.js'));
        // expect(zhExists).toBe(true);
        // expect(enExists).toBe(true);
    });

    it('各语言Key相同', async () => {
        const zh = parseLocalJson(fs.readFileSync(path.resolve(parsed.target, 'zh.js'), encode));
        const en = parseLocalJson(fs.readFileSync(path.resolve(parsed.target, 'en.js'), encode));
        const th = parseLocalJson(fs.readFileSync(path.resolve(parsed.target, 'th.js'), encode));

        const zhSize = Object.keys(zh).length;
        const enSize = Object.keys(en).length;
        const thSize = Object.keys(th).length;

        expect(zhSize === enSize).toBe(true);
        expect(zhSize === thSize).toBe(true);

        expect(Object.keys(zh).every(zhKey => {
            return ((zhKey in en) && (zhKey in th));
        })).toBe(true);
    });

});