module.exports = function (shift, pixels) {
  const mod = (1 - shift)
  const data = pixels.data
  for (var i = 0; i < data.length; i += 3) {
    data[i+1] = Math.floor(data[i+1] * mod)
    data[i+2] = Math.floor(data[i+2] * mod)
  }
}
