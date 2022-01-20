const getKduJestConfig = require('./get-kdu-jest-config')
const cssExtract = require('extract-from-css')

module.exports = function processStyle (stylePart, filePath, jestConfig = {}) {
  const kduJestConfig = getKduJestConfig(jestConfig)

  if (!stylePart || kduJestConfig.experimentalCSSCompile === false) {
    return {}
  }

  const processStyleByLang = lang => require('./compilers/' + lang + '-compiler')(stylePart.content, filePath, jestConfig)

  let cssCode = stylePart.content
  switch (stylePart.lang) {
    case 'styl':
    case 'stylus':
      cssCode = processStyleByLang('stylus')
      break
    case 'scss':
      cssCode = processStyleByLang('scss')
      break
    case 'sass':
      cssCode = processStyleByLang('sass')
      break
    case 'pcss':
    case 'postcss':
      cssCode = processStyleByLang('postcss')
      break
  }

  const cssNames = cssExtract.extractClasses(cssCode)

  const obj = {}
  for (let i = 0, l = cssNames.length; i < l; i++) {
    obj[cssNames[i]] = cssNames[i]
  }

  return obj
}
