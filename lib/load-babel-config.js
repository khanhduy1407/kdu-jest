const findBabelConfig = require('find-babel-config')
const logger = require('./logger')
const cache = require('./cache')
const deprecate = require('./deprecate')
const path = require('path')
const { readFileSync, existsSync } = require('fs')

module.exports = function getBabelConfig (kduJestConfig, filePath) {
  const find = () => {
    const { file, config } = findBabelConfig.sync(filePath || process.cwd())

    if (!file) {
      logger.info('no .babelrc found, skipping babel compilation')
      cache.set('babel-config', false)
      return
    }

    return config
  }
  const cachedConfig = cache.get('babel-config')
  if (cachedConfig) {
    return cachedConfig
  } else if (cachedConfig === false) {
    return
  } else {
    let babelConfig

    if (kduJestConfig.babelRcFile) {
      deprecate.replace('babelRcFile', 'babelConfig')
      babelConfig = JSON.parse(readFileSync(kduJestConfig.babelRcFile))
    } else if (kduJestConfig.hasOwnProperty('babelConfig')) {
      switch (typeof kduJestConfig.babelConfig) {
        case 'string':
          // a path to a config file is being passed in; load it
          babelConfig = require(kduJestConfig.babelConfig)
          break
        case 'boolean':
          // if babelConfig is true, search for it. If false, will end up
          // returning undefined which results in no babel processing
          if (kduJestConfig.babelConfig === true) {
            babelConfig = find()
          }
          break
        case 'object':
        default:
          // support for inline babel options
          babelConfig = kduJestConfig.babelConfig
          break
      }
    } else if (existsSync('babel.config.js')) {
      babelConfig = require(path.resolve('babel.config.js'))
    } else {
      babelConfig = find()
    }

    if (babelConfig) {
      cache.set('babel-config', babelConfig)
    }

    return babelConfig
  }
}
