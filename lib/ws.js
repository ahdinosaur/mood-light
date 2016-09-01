module.exports = function (url, cb) {
  var end = false
  const ws = new WebSocket(url)
  ws.onclose = function (err) {
    end = true
  }

  return function write (pixels) {
    if (end) return
    var data = Uint8Array.from(pixels.data)
    var buffer = Buffer(data.buffer)
    ws.send(buffer, { binary: true })
  }
}

