const esprima = require('esprima');
// const readline = require('readline');

// console.log(x) or console['error'](y)
function isConsoleCall(node) {
    return (node.type === 'CallExpression') &&
        (node.callee.type === 'MemberExpression') &&
        (node.callee.object.type === 'Identifier') &&
        (node.callee.object.name === 'console');
}

function removeCalls(source) {
    const entries = [];
    esprima.parseScript(source, {}, function (node, meta) {
        if (isConsoleCall(node)) {
            entries.push({
                start: meta.start.offset,
                end: meta.end.offset
            });
            console.log(entries);
        }
    });
    entries.sort((a, b) => { return b.end - a.end }).forEach(n => {
        source = source.slice(0, n.start) + source.slice(n.end);
    });
    return source;
}
let source = `const a = 3; console.log({
    name: 'hubenlv',
    age: 29
})`;

console.log(removeCalls(source));

// readline.createInterface({ input: process.stdin, terminal: false })
// .on('line', line => { source += line + '\n' })
// .on('close', () => { console.log(removeCalls(source)) });