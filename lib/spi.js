const SPI = require('pi-spi')

module.exports = Spi

function Spi (opts) {
  opts = opts || {}

  var spi = SPI.initialize(opts.device)

  if (opts.clockSpeed) {
    spi.clockSpeed(opts.clockSpeed)
  }

  if (opts.dataMode) {
    spi.dataMode(opts.dataMode)
  }

  if (opts.bitOrder) {
    spi.bitOrder(opts.bitOrder)
  }
  
  return function writeToSpi (buffer, cb) {
    spi.write(buffer, cb || logError)
  }
}

function logError (err) {
  if (err) console.error(err)
}
