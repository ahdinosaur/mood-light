// thanks http://stackoverflow.com/a/846249
module.exports = LogValue

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

