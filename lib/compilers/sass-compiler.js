const ensureRequire = require('../ensure-require')
const getKduJestConfig = require('../get-kdu-jest-config')
const logger = require('../logger')

const applyModuleNameMapper = require('./helpers/module-name-mapper-helper')

/**
 * This module is meant to compile sass
 *
 * @param {String} content - the content of the sass string that should be compiled
 * @param {String} filePath - the path of the file holding the sass
 * @param {Object} jestConfig - the complete jest config
 * @returns {String} styles - the compiled sass
 */
module.exports = (content, filePath, jestConfig = {}) => {
  const kduJestConfig = getKduJestConfig(jestConfig)

  ensureRequire('sass', ['node-sass'])
  const sass = require('node-sass')

  try {
    return sass.renderSync({
      data: content,
      outputStyle: 'compressed',
      indentedSyntax: true,
      importer: (url, prev, done) => ({ file: applyModuleNameMapper(url, prev === 'stdin' ? filePath : prev, jestConfig) })
    }).css.toString()
  } catch (err) {
    if (!kduJestConfig.hideStyleWarn) {
      logger.warn(`There was an error rendering the SASS in ${filePath}. SASS is fully supported by kdu-jest. Still some features might throw errors. Webpack aliases are a common cause of errors. If you use Webpack aliases, please use jest's suggested way via moduleNameMapper which is supported.`)
      logger.warn(`Error while compiling styles: ${err}`)
    }
  }

  return ''
}
