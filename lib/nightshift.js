const Rgb = require('color-space/rgb')
const Lms = require('color-space/lms')
const Xyz = require('color-space/xyz')
const colorTemperature2rgb = require('color-temperature').colorTemperature2rgb

const DEFAULT_SHIFT = 0.5

module.exports = function (shift, pixels) {
  if (shift === DEFAULT_SHIFT) return
  const src = colorTemp(Temp(DEFAULT_SHIFT))
  const dest = colorTemp(Temp(shift))

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

// shift is between 0 and 1.0
// returns color temperature in kelvin
// thanks http://stackoverflow.com/a/846249
const logTemp = LogValue({
  minInput: 0,
  maxInput: 1,
  minOutput: 1e3,
  maxOutput: 60e3
})

function Temp (shift) {
  shift = 1 - shift
  return logTemp(shift)
}

function LogValue (options) {
  // the input is between min and max
  const minInput = options.minInput
  const maxInput = options.maxInput
  // the output should be between min and max
  const minOutput = Math.log(options.minOutput)
  const maxOutput = Math.log(options.maxOutput)

  // calculate adjustment factor
  const scale = (maxOutput - minOutput) / (maxInput - minInput)

  return function (input) {
    return Math.exp(minOutput + scale * (input - minInput))
  }
}
