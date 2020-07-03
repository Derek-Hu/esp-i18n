import babelConfig from '~/babel';
import fs from 'fs';
import path from 'path';

const babelParser = require("@babel/parser");

test('支持解析JS代码', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'test/code/placeholder/placeholder.js'), 'UTF8');
    const astTree = babelParser.parse(source, babelConfig(false));
    expect(astTree).not.toBeFalsy();
    expect(astTree.type).toEqual('File');
});

test('支持解析TS代码', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'test/code/placeholder/placeholder.ts'), 'UTF8');
    const astTree = babelParser.parse(source, babelConfig(false));
    expect(astTree).not.toBeFalsy();
    expect(astTree.type).toEqual('File');
});

test('支持解析TSX代码', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'test/code/placeholder/placeholder.tsx'), 'UTF8');
    const astTree = babelParser.parse(source, babelConfig(false));
    expect(astTree).not.toBeFalsy();
    expect(astTree.type).toEqual('File');
});

test('支持解析JSX代码', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'test/code/placeholder/placeholder.jsx'), 'UTF8');
    const astTree = babelParser.parse(source, babelConfig(false));
    expect(astTree).not.toBeFalsy();
    expect(astTree.type).toEqual('File');
});

test('支持解析Flow代码', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'test/code/placeholder/placeholder-flow.js'), 'UTF8');
    const astTree = babelParser.parse(source, babelConfig(true));
    expect(astTree).not.toBeFalsy();
    expect(astTree.type).toEqual('File');
});