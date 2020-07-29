import path from 'path';
import paramParser from '~/param';

test('必须提供的参数配置', () => {

    expect(() => {
        paramParser(null);
    }).toThrow('请提供参数folders，以指定要扫描的目录');

    expect(() => {
        paramParser({
            folders: [12]
        });
    }).toThrow('参数folders为字符串数组，Received: ');

    expect(() => {
        paramParser({
            folders: ['src'],
            translate: ['abc']
        });
    }).toThrow('不支持语言：');

    expect(() => {
        paramParser({
            folders: ['src'],
            translate: 'abc'
        });
    }).toThrow(`translate配置为字符串数组，如['en']，支持列表见 https://github.com/Derek-Hu/esp-i18n/blob/master/src/languages.js`);

    expect(() => {
        paramParser({
            folders: ['src'],
            translate: [1, 3]
        });
    }).toThrow(`translate配置为字符串数组，如['en']，支持列表见 https://github.com/Derek-Hu/esp-i18n/blob/master/src/languages.js`);

    expect(() => {
        paramParser({
            folders: ['src'],
        });
    }).toThrow(`请配置localTools参数，以提供i18n工具函数。如localTools配置为'~/localTools', 则生成代码import {formatMessage} from '~/localTools'`);

    expect(() => {
        paramParser({
            folders: ['src'],
            idName: '100',
            localTools: '~/locale-tools',
        });
    }).toThrow(`idName变量只能包含数字、字母、_、$，且不能以数字开头`);
});

test('正确处理配置参数默认值', () => {

    const param = {
        folders: ['test'],
        localTools: '~/locale-tools',
    };
    const options = paramParser(param);

    const { jsFunc, translateLanguages, isFlow, localToolsPath, folders, baseFolder, srcTarget, excludes, target } = options;
    expect(jsFunc).toBe('formatMessage');
    expect(translateLanguages.includes('en')).toBe(true);
    expect(translateLanguages.includes('zh')).toBe(true);
    expect(isFlow).toBe(false);
    expect(localToolsPath).toEqual(param.localTools);
    expect(folders).toEqual(param.folders);

    expect(baseFolder).toEqual(srcTarget);
    expect(baseFolder).toEqual(process.cwd());

    expect(excludes.includes(target)).toBe(true);

});

test('正确处理参数配置化', () => {

    const param = {
        folders: ['test'],
        localTools: '~/locale-tools',
        headless: false,
        translate: ['th'],
        isFlow: true,
        srcCopyFolder: 'dist',
        target: 'test/locale',
        jsName: 'fm',
        excludes: ['test/code/vue', 'test/code/placeholder'],
    };
    const options = paramParser(param);

    const { jsFunc, translateLanguages, isFlow, localToolsPath, folders, baseFolder, srcTarget, excludes, target, launchOptions } = options;

    expect(jsFunc).toBe(param.jsName);
    expect(launchOptions.headless).toBe(param.headless);
    expect(isFlow).toBe(param.isFlow);

    expect(translateLanguages.includes('en')).toBe(false);
    expect(translateLanguages.includes('th')).toBe(true);
    expect(translateLanguages.includes('zh')).toBe(true);

    expect(path.relative(baseFolder, srcTarget)).toEqual(param.srcCopyFolder);
    expect(path.relative(baseFolder, target)).toEqual(param.target);
    expect(excludes.includes(target)).toBe(true);

});