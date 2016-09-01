const Hsl = require('color-space/hsl')
const Rgb = require('color-space/rgb')

module.exports = function (pixels) {
  const data = pixels.data
  for (var i = 0; i < data.length; i += 3) {
    const hsl = [data[i+0] * 360, data[i+1] * 100, data[i+2] * 100]
    const rgb = Hsl.rgb(hsl)
    data[i+0] = rgb[0]
    data[i+1] = rgb[1]
    data[i+2] = rgb[2]
  }
}
