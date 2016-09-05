const Rgb = require('color-space/rgb')
const Lms = require('color-space/lms')
const Xyz = require('color-space/xyz')
const colorTemperature2rgb = require('color-temperature').colorTemperature2rgb

module.exports = function (srcTemp, destTemp, pixels) {
  if (srcTemp === destTemp) return

  const src = colorTemp(srcTemp)
  const dest = colorTemp(destTemp)

  const data = pixels.data
  for (var i = 0; i < data.length; i += 3) {
    const color = [data[i], data[i+1], data[i+2]]
    const balanced = whiteBalance(color, src, dest)
    data[i] = balanced[0]
    data[i+1] = balanced[1]
    data[i+2] = balanced[2]
  }
}

// taken from "Chromatic Adaptation / Whitebalancing"
// https://github.com/JuliaGraphics/Colors.jl/blob/master/src/algorithms.jl
function whiteBalance (color, source, destination) {
  const c = rgbToLms(color)
  const src = rgbToLms(source)
  const dest = rgbToLms(destination)

  const balanced = [
    c[0] * dest[0] / src[0],
    c[1] * dest[1] / src[1],
    c[2] * dest[2] / src[2]
  ]

  return lmsToRgb(balanced)
}

function rgbToLms (rgb) {
  return Xyz.lms(Rgb.xyz(rgb))
}

function lmsToRgb (lms) {
  return Xyz.rgb(Lms.xyz(lms))
}

function colorTemp (temp) {
  const color = colorTemperature2rgb(temp)
  return [color.red, color.green, color.blue]
}
