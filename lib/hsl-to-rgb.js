module.exports = function (pixels) {
  const data = pixels.data
  for (var i = 0; i < data.length; i += 3) {
    const rgb = hslToRgb(data[i+0], data[i+1], data[i+2])
    data[i+0] = rgb[0]
    data[i+1] = rgb[1]
    data[i+2] = rgb[2]
  }
}

function hslToRgb (h, s, l) {
  h = mod(h, 1)
  s = Math.min(Math.max(0, s), 1)
  l = Math.min(Math.max(0, l), 1)
  var r, g, b
  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s
    var p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

function hue2rgb (p, q, t) {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

function mod (n, m) {
  return ((n % m) + m) % m
}
