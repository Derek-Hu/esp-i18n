import Utils from '~/utils';
import path from 'path';
import fs from 'fs';

test('扫描JS, TS, VUE文件', () => {
    const files = Utils.getJSFileList(path.resolve(process.cwd(), 'test'));

    const supportted = ['js', 'jsx', 'ts', 'tsx', 'vue'];
    const notSupport = ['css', 'scss', 'sass', 'less', 'html', 'jpg', 'jpeg', 'png', 'svg'];

    const allSupport = supportted.every(support => {
        return files.find(file => new RegExp(`\.${support}$`).test(file));
    });

    const allNotSupport = notSupport.every(not => {
        return !files.find(file => new RegExp(`\.${not}$`).test(file));
    });
    expect(allSupport).toBe(true);
    expect(allNotSupport).toBe(true);
});


test('自动生成目录', () => {
    const notExistsFolder = path.resolve(__dirname, 'not_exitst_folder');
    const notExistsFile = path.resolve(notExistsFolder, 'not_exists_file');

    const fileContent = 'it works';

    Utils.writeSync(notExistsFile, fileContent);
    const content = fs.readFileSync(notExistsFile, 'UTF8');

    expect(fileContent).toEqual(content);

    fs.unlinkSync(notExistsFile);
    fs.rmdirSync(notExistsFolder);
});

test('识别中文', () => {
    expect(Utils.isChineaseText('哈哈')).toBe(true);
    expect(Utils.isChineaseText('abc哈哈')).toBe(true);
    expect(Utils.isChineaseText('abc哈哈bb')).toBe(true);
    expect(Utils.isChineaseText('aabc')).toBe(false);
    expect(Utils.isChineaseText('123')).toBe(false);
    expect(Utils.isChineaseText('(')).toBe(false);

    expect(Utils.isChineaseText('？')).toBe(true);
    expect(Utils.isChineaseText('。')).toBe(true);
    expect(Utils.isChineaseText('（')).toBe(true);
    expect(Utils.isChineaseText('）')).toBe(true);

});

test('ID为空', () => {
    expect(Utils.isIdEmpty(undefined)).toBe(true);
    expect(Utils.isIdEmpty(null)).toBe(true);
    expect(Utils.isIdEmpty('')).toBe(false);
    expect(Utils.isIdEmpty(0)).toBe(false);
    expect(Utils.isIdEmpty(1)).toBe(false);
    expect(Utils.isIdEmpty(false)).toBe(false);
});

test('locale生成ID唯一化', () => {

    const duplicateKeys = {};
    const zhLocaleData = {};

    const sequence = [{
        id: 'hello',
        value: '你好',
        valid: 'hello',
    }, {
        id: 'hello',
        value: '你好',
        valid: 'hello',
    }, {
        id: 'hello',
        value: '您好',
        valid: 'hello-1',
    }, {
        id: 'hello',
        value: '哈啰',
        valid: 'hello-2',
    }, {
        id: 'hello-2',
        value: '哈啰-2',
        valid: 'hello-2-1',
    }];


    sequence.forEach(({ id, value, valid }) => {
        let uniqueId = Utils.getUniqueId(id, value, zhLocaleData, duplicateKeys);
        expect(uniqueId).toBe(valid);
    });
    expect(duplicateKeys).toEqual({ hello: 2, "hello-2": 1 });
    expect(zhLocaleData).toEqual({ hello: '你好', 'hello-1': '您好', 'hello-2': '哈啰', "hello-2-1": "哈啰-2", });

});

test('import as 名称唯一化', () => {

    const all = {
        formatMessage: 'another',
        formatMessage1: 'formatMessage1',
        formatMessage2: 'another',
    };
    const sequence = [{
        id: 'formatMessage',
        valid: 'formatMessage3',
    }, {
        id: 'formatMessage1',
        valid: 'formatMessage1',
    }, {
        id: 'another',
        valid: 'formatMessage',
    }];

    sequence.forEach(({ id, valid }) => {
        let uniqueId = Utils.getUniqueImportId(id, all);
        expect(uniqueId).toBe(valid);
    });

});



