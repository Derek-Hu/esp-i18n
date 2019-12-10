"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const fs = require('fs');

const path = require('path');

const puppeteer = require('puppeteer');

const esprima = require('esprima');

const Utils = require('./utils');

const Types = {
  JSXText: 'JSXText',
  JSXAttribute: 'JSXAttribute'
};

function isChineaseText(value) {
  return /[\u4e00-\u9fa5]/.test(value);
}

function getJSFileList(root) {
  let res = [];
  let files = fs.readdirSync(root);
  files.forEach(file => {
    const pathname = path.join(root, file);
    const stat = fs.lstatSync(pathname);

    if (!stat.isDirectory() && /\.js$/.test(pathname)) {
      res.push(pathname);
    } else if (stat.isDirectory()) {
      console.log('pathname', pathname);
      res = res.concat(getJSFileList(pathname));
    }
  });
  return res;
}

module.exports =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (params) {
    const folders = params.folders || [];
    const baseFolder = process.cwd();
    const localToolsPath = params.localTools || '~/locale-tools';
    const target = path.resolve(process.cwd(), params.target);

    function isChinaCall(node, meta, file, nameMapping) {
      const Names = {
        formatMessage: nameMapping['formatMessage'] || 'formatMessage',
        FormattedMessage: nameMapping['FormattedMessage'] || 'FormattedMessage'
      };
      const hasImported = node.type === 'ImportDeclaration' && node.source.value === localToolsPath;
      const type = Types[node.type];
      const value = type && type === 'JSXAttribute' ? node.value.value : node.value;
      const isJSXAttribute = type === 'JSXAttribute';
      const attr = isJSXAttribute ? node.name.name : null;

      if (type && isChineaseText(value)) {
        return {
          isComponent: !isJSXAttribute,
          attr: attr,
          start: meta.start.offset,
          end: meta.end.offset,
          hasImported: hasImported,
          value: value,
          file: file,
          getReplacement: id => isJSXAttribute ? `${attr}={${Names['formatMessage']}({id: '${id}'})}` : `<${Names['FormattedMessage']} id="${id}" />`
        };
      }
    }

    const browser = yield puppeteer.launch({
      headless: params.headless !== false
    });
    process.on('uncaughtException',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      yield browser.close();
    }));
    const page = yield browser.newPage();
    yield page.setViewport({
      width: 1680,
      height: 947,
      deviceScaleFactor: 1
    });
    const englishJSON = {};
    const chinaJSON = {};

    function translation(_x2) {
      return _translation.apply(this, arguments);
    }

    function _translation() {
      _translation = _asyncToGenerator(function* (words) {
        const selector = 'p.ordinary-output.target-output';
        yield page.goto(`https://fanyi.baidu.com/#zh/en/${decodeURIComponent(words)}`, {
          waitUntil: 'networkidle0'
        });
        yield page.reload();
        yield page.waitForFunction(selector => !!document.querySelector(selector), {}, selector); // await page.reload();

        try {
          const datas = yield page.evaluate(() => {
            function formatWord(word) {
              return word.toLowerCase().replace(/[,.:']/g, '').trim().replace(/\s/g, '-');
            }

            const translationEle = document.querySelector("p.ordinary-output.target-output");
            const keyMeansElems = document.querySelectorAll("ul.keywords-container li.keywords-content .keywords-means");
            const keyMeans = Array.prototype.slice.call(keyMeansElems).map(ele => ele.textContent);
            const translation = translationEle.textContent.trim();
            let id = null;
            const translationParts = translation.split(' ');
            const maxWords = 4;

            if (translationParts.length <= maxWords) {
              id = formatWord(translation);
            } else {
              const allFirstMeans = keyMeans.map(means => {
                const firstMeans = means.split(';');

                if (firstMeans && firstMeans[0]) {
                  return firstMeans[0];
                }

                return '';
              }).filter(v => v);
              id = allFirstMeans.reduce((means, word, index) => {
                if (index >= maxWords) {
                  return means;
                }

                means.push(formatWord(word));
                return means;
              }, []).join('-');
            }

            return {
              id: id,
              english: translation
            };
          }, {});
          chinaJSON[datas.id] = words;
          englishJSON[datas.id] = datas.english;
          return datas && datas.id ? datas.id : words;
        } catch (e) {
          console.log(e);
          return words;
        }
      });
      return _translation.apply(this, arguments);
    }

    function getId(_x3, _x4) {
      return _getId.apply(this, arguments);
    }

    function _getId() {
      _getId = _asyncToGenerator(function* (value, file) {
        const relativePath = path.relative(baseFolder, file);
        const parts = relativePath.split(/[\\\/]/);
        const name = parts.reduce((names, part, index) => {
          if (index === 0) {
            if (part === 'src') {
              return names;
            }

            names.push(part);
          } else {
            names.push(part[0] + part.substring(1));
          }

          return names;
        }, []).join('-');
        const id = yield translation(value);
        return `${name.replace(/\.js$/, '')}.${id ? id : value}`;
      });
      return _getId.apply(this, arguments);
    }

    function asyncForEach(_x5, _x6) {
      return _asyncForEach.apply(this, arguments);
    }

    function _asyncForEach() {
      _asyncForEach = _asyncToGenerator(function* (array, callback) {
        for (let index = 0; index < array.length; index++) {
          yield callback(array[index], index, array);
        }
      });
      return _asyncForEach.apply(this, arguments);
    }

    yield asyncForEach(folders,
    /*#__PURE__*/
    function () {
      var _ref3 = _asyncToGenerator(function* (folder) {
        const jsFiles = getJSFileList(path.resolve(baseFolder, folder));
        yield asyncForEach(jsFiles,
        /*#__PURE__*/
        function () {
          var _ref4 = _asyncToGenerator(function* (file) {
            const entries = [];
            let source = fs.readFileSync(file, 'UTF8').replace(/@/g, '');
            let hasImported = false;
            let importMeta = null;
            const importToolNames = [];
            const nameMapping = {};

            try {
              esprima.parseModule(source, {
                jsx: true,
                tokens: true
              }, function (node, meta) {
                if (!hasImported) {
                  hasImported = node.type === 'ImportDeclaration' && node.source.value === localToolsPath;

                  if (hasImported) {
                    node.specifiers.forEach(spec => {
                      nameMapping[spec.imported.name] = spec.local.name;
                      importToolNames.push(`${spec.imported.name}${spec.imported.name !== spec.local.name ? ` as ${spec.local.name}` : ''}`);
                    });
                    importMeta = {
                      start: meta.start.offset,
                      end: meta.end.offset
                    };
                  }
                }

                const call = isChinaCall(node, meta, file, nameMapping);

                if (call) {
                  entries.push(call);
                }
              });
              yield asyncForEach(entries,
              /*#__PURE__*/
              function () {
                var _ref5 = _asyncToGenerator(function* (entry) {
                  entry.id = yield getId(entry.value, entry.file);
                });

                return function (_x9) {
                  return _ref5.apply(this, arguments);
                };
              }()); // 动态计算 import { formatMessage, FormattedMessage } from ${localToolsPath};

              const hasJSToolImport = entries.some(entry => !entry.isComponent);
              const hasCompToolImport = entries.some(entry => entry.isComponent);
              const metas = {
                formatMessage: hasJSToolImport,
                FormattedMessage: hasCompToolImport
              };
              Object.keys(metas).forEach(key => {
                if (metas[key]) {
                  let statement = null;

                  if (nameMapping[key] && nameMapping[key] !== key) {
                    statement = `${key} as ${nameMapping[key]}`;
                  } else {
                    statement = key;
                  }

                  if (statement && !importToolNames.includes(statement)) {
                    importToolNames.push(statement);
                  }
                }
              });
              let finalImport;

              if (importToolNames.length) {
                finalImport = `import { ${importToolNames.join(', ')} } from '${localToolsPath}';\n`;
              }

              const sortedEntries = entries.sort((a, b) => {
                return b.end - a.end;
              });

              if (hasImported && finalImport) {
                sortedEntries.push(Object.assign({}, importMeta, {
                  getReplacement: () => finalImport
                }));
              }

              sortedEntries.forEach(n => {
                source = source.slice(0, n.start) + n.getReplacement(n.id) + source.slice(n.end);
              });

              if (finalImport && !hasImported) {
                source = finalImport + source;
              }

              Utils.writeSync(file, source);
            } catch (e) {
              console.log(`解析文件失败：${file}`);
            }
          });

          return function (_x8) {
            return _ref4.apply(this, arguments);
          };
        }());
      });

      return function (_x7) {
        return _ref3.apply(this, arguments);
      };
    }());
    Utils.writeSync(path.resolve(target, 'zh_CN.js'), `export default ${JSON.stringify(chinaJSON, null, 2)}`);
    Utils.writeSync(path.resolve(target, 'en_US.js'), `export default ${JSON.stringify(englishJSON, null, 2)}`);
    yield browser.close();
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();