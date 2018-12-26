'use strict'
const servers = new Map()
module.exports = {
  add: (url, guildId) => {
    const Q = servers.get(guildId)
    if (!Q) {
      servers.set(guildId, [url])
    } else {
      Q.push(url)
    }
  },
  get: guildId => servers.get(guildId),
  flush: guildId => servers.delete(guildId)
}
