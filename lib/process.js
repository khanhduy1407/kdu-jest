const kduCompiler = require('kdu-template-compiler')
const compileTemplate = require('./template-compiler')
const generateSourceMap = require('./generate-source-map')
const addTemplateMapping = require('./add-template-mapping')
const compileBabel = require('./compilers/babel-compiler')
const compileTypescript = require('./compilers/typescript-compiler')
const compileCoffeeScript = require('./compilers/coffee-compiler')
const processStyle = require('./process-style')
const getKduJestConfig = require('./get-kdu-jest-config')
const fs = require('fs')
const path = require('path')
const join = path.join
const logger = require('./logger')
const convertSourceMap = require('convert-source-map')
const splitRE = /\r?\n/g

function processScript (scriptPart, kduJestConfig, filePath) {
  if (!scriptPart) {
    return { code: '' }
  }

  if (/^typescript|tsx?$/.test(scriptPart.lang)) {
    return compileTypescript(scriptPart.content, kduJestConfig, filePath)
  }

  if (scriptPart.lang === 'coffee' || scriptPart.lang === 'coffeescript') {
    return compileCoffeeScript(scriptPart.content, kduJestConfig, filePath)
  }

  return compileBabel(scriptPart.content, undefined, undefined, kduJestConfig, filePath)
}

module.exports = function (src, filePath, jestConfig) {
  const kduJestConfig = getKduJestConfig(jestConfig)

  var parts = kduCompiler.parseComponent(src, { pad: true })

  if (parts.script && parts.script.src) {
    parts.script.content = fs.readFileSync(join(filePath, '..', parts.script.src), 'utf8')
  }

  const result = processScript(parts.script, kduJestConfig, filePath)
  const script = result.code
  const inputMap = result.sourceMap

  let scriptSrc = src
  if (parts.script && parts.script.src) {
    scriptSrc = parts.script.content
  }

  const map = generateSourceMap(script, '', filePath, scriptSrc, inputMap)

  let output = ';(function(){\n' + script + '\n})()\n' +
    'var defaultExport = (module.exports.__esModule) ? module.exports.default : module.exports;' +
    'var __kdu__options__ = (typeof defaultExport === "function"' +
    '? defaultExport.options' +
    ': defaultExport)\n'

  if (parts.template) {
    parts.template.filename = filePath
    if (parts.template.src) {
      parts.template.filename = join(filePath, '..', parts.template.src)
      parts.template.content = fs.readFileSync(parts.template.filename, 'utf8')
    }

    const renderFunctions = compileTemplate(parts.template, kduJestConfig)

    output += '__kdu__options__.render = ' + renderFunctions.render + '\n' +
      '__kdu__options__.staticRenderFns = ' + renderFunctions.staticRenderFns + '\n'

    if (parts.template.attrs.functional) {
      output += '__kdu__options__.functional = true\n'
      output += '__kdu__options__._compiled = true\n'
    }

    if (map) {
      const beforeLines = output.split(splitRE).length
      addTemplateMapping(script, parts, output, map, beforeLines)
    }
  }

  if (Array.isArray(parts.styles) && parts.styles.length > 0) {
    if ((parts.styles.some(ast => /^less/.test(ast.lang))) && logger.shouldLogStyleWarn) {
      !kduJestConfig.hideStyleWarn && logger.warn('Less are not currently compiled by kdu-jest')
      logger.shouldLogStyleWarn = false
    }

    const styleStr = parts.styles
      .filter(ast => ast.module)
      .map(ast => {
        const styleObj = (/^less/.test(ast.lang))
          ? {}
          : processStyle(ast, filePath, jestConfig)

        const moduleName = ast.module === true ? '$style' : ast.module

        return `
        if(!this['${moduleName}']) {
          this['${moduleName}'] = {};
        }
        this['${moduleName}'] = Object.assign(this['${moduleName}'], ${JSON.stringify(styleObj)});
        `
      })
      .filter(_ => _)
      .join('')

    if (styleStr.length !== 0) {
      if (parts.template && parts.template.attrs.functional) {
        output += `
        ;(function() {
          var originalRender = __kdu__options__.render
          var styleFn = function () { ${styleStr} }
          __kdu__options__.render = function renderWithStyleInjection (h, context) {
            styleFn.call(context)
            return originalRender(h, context)
          }
        })()
        `
      } else {
        output += `
        ;(function() {
          var beforeCreate = __kdu__options__.beforeCreate
          var styleFn = function () { ${styleStr} }
          __kdu__options__.beforeCreate = beforeCreate ? [].concat(beforeCreate, styleFn) : [styleFn]
        })()
        `
      }
    }
  }

  if (map) {
    output += '\n' + convertSourceMap.fromJSON(map.toString()).toComment()
  }

  return { code: output }
}
