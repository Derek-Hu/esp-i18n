"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _esprima = _interopRequireDefault(require("esprima"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const program = _fs.default.readFileSync('/Users/hubenlv/workspaces/rc-frontend/src/pages/login/index.js');

const results = _esprima.default.parseModule(program, {
  jsx: true,
  tokens: true
});

console.log(results);