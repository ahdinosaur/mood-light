module.exports = function (url, cb) {
  const ws = new WebSocket(url)

  return function write (pixels) {
    var data = Uint8Array.from(pixels.data)
    var buffer = Buffer(data.buffer)
    ws.send(buffer, { binary: true })
  }
}

