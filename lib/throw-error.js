module.exports = function error (msg) {
  throw new Error('\n[kdu-jest] Error: ' + (msg) + '\n')
}
