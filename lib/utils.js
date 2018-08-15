'use strict'

function flatten(obj, prefix = '') {
  const flatObject = {}
  for (const key in obj) {
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      Object.assign(flatObject, this.flatten(obj[key], prefix + key + '.'))
    } else {
      flatObject[prefix + key] = obj[key]
    }
  }
  return flatObject
}

module.exports = { flatten }