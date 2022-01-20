/**
 * This module extracts kdu-jest relevant parts of a jest config
 *
 * @param {Object} jestConfig - a complete jest config object
 * @returns {Object} kduJestConfig - an object holding kdu-jest specific configuration
 */
module.exports = function getKduJestConfig (jestConfig) {
  return (jestConfig && jestConfig.globals && jestConfig.globals['kdu-jest']) || {}
}
