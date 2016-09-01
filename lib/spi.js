const getFrame = require('pixels-apa102')
const SPI = require('pi-spi')

module.exports = Spi

function Spi (opts) {
  opts = opts || {}

  try {
    var spi = SPI.initialize(opts.device)
  } catch (err) {
    console.error(err)
    return noop
  }

  if (opts.clockSpeed) {
    spi.clockSpeed(opts.clockSpeed)
  }

  if (opts.dataMode) {
    spi.dataMode(opts.dataMode)
  }

  if (opts.bitOrder) {
    spi.bitOrder(opts.bitOrder)
  }
  
  return function writeToSpi (pixels, cb) {
    const buffer = getFrame(pixels)
    spi.write(buffer, cb || logError)
  }
}

function logError (err) {
  if (err) console.error(err)
}

function noop () {}
