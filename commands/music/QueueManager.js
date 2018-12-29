'use strict'
const { getInfo } = require('ytdl-getinfo')
const { secondsToTimeString } = require('$lib/utils')
const servers = new Map()

function extractMetadata (info) {
  info = info.items[0]
  const date = info.upload_date
  return {
    title: info.fulltitle,
    duration: secondsToTimeString(info.duration),
    likes: info.like_count,
    dislikes: info.dislike_count,
    ratio: info.dislike_count ? ((info.like_count / (info.like_count + info.dislike_count)) * 100).toFixed(2) : 100,
    tags: info.tags ? info.tags.join() : 'No tags',
    views: info.view_count.toLocaleString(),
    description: info.description.length >= 2048 ? info.description.substr(0, 2045) + '...' : info.description,
    uploader: info.uploader,
    uploadDate: new Date(date.substring(0, 4), +date.substring(4, 6) - 1, date.substring(6, 8)).toDateString(),
    uploaderUrl: info.uploader_url,
    thumbnail: info.thumbnail
  }
}

module.exports = {
  add: (url, guildId) => {
    return getInfo(url).then(info => {
      const song = extractMetadata(info)
      song.url = url
      const Q = servers.get(guildId)
      if (!Q) {
        servers.set(guildId, [song])
      } else {
        Q.push(song)
      }
      return song
    })
  },
  get: guildId => servers.get(guildId),
  flush: guildId => servers.delete(guildId)
}
