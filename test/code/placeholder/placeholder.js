import { stat, exists, readFile } from 'fs';

import('./remote');


console.log(stat, exists, readFile);

// let & var
const log = () => {
    for (let i = 0; i < 10; i++) {
        // ...
    }
    console.log(i);
}

function testable(target) {
    target.isTestable = true;
}

@testable
class FakeMath {
    static PI = 22 / 7;
    static totallyRandomNumber = 4;

    static computeRandomNumber() {
        return FakeMath.totallyRandomNumber;
    }

    static random() {
        console.log('这是中文');
        console.log("这是中文");
        console.log(`这是中文`);
        return FakeMath.computeRandomNumber();
    }
}
console.log(FakeMath);

class Rectangle {
    constructor(length, width) {
        console.log(new.target === Rectangle);
        // ...
    }
}

class Square extends Rectangle {
    constructor(length, width) {
        super(length, width);
    }
}

var objExtends = new Square(3); // 输出 false

function add(...values) {
    let sum = 0;

    for (var val of values) {
        sum += val;
    }

    return sum;
}

(() => {
    const [foo, [[bar], baz]] = [1, [[2], 3]];
});

(() => {
    let { foo, bar } = { foo: 'aaa', bar: 'bbb' };
    var { x, y = 5 } = { x: 1 };
    const b = 15346349309n;
});

(() => {
    const b = 15346349309n;
    let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };
});


(() => {
    let myIterable = {
        [Symbol.iterator]: function* () {
            yield 1;
            yield 2;
            yield 3;
        }
    }
    const values = [...myIterable] // [1, 2, 3]

    // 或者采用下面的简洁写法

    let obj = {
        *[Symbol.iterator]() {
            yield 'hello';
            yield 'world';
        }
    };

    for (let x of obj) {
        console.log(x);
    }
});

(() => {
    function timeout(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    async function asyncPrint(value, ms) {
        await timeout(ms);
        console.log(value);
    }

    asyncPrint('hello world', 50);
});

var firstName = 'Michael';
var lastName = 'Jackson';
var year = 1958;

@testable
export default class T extends Rectangle {

}
export { firstName, lastName, year as fullYear };