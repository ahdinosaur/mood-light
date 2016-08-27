const mod = require('mod-op')

module.exports = rainbow

function rainbow (params, t, state) {
  const step = params.step()
  const saturation = params.saturation()
  const lightness = params.lightness()

  var { data } = state
  for (var c = 0, i = 0; c < data.length; c++, i += 3) {
    data[i] = mod(
      (c * step) + t,
      1
    )
    data[i + 1] = saturation
    data[i + 2] = lightness
  }
}

