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



