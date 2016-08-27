const NdArray = require('ndarray')
const workerTimer = require('worker-timer')
const Value = require('@mmckegg/mutant/value')
const Struct = require('@mmckegg/mutant/struct')
const h = require('@mmckegg/mutant/html-element')
const watch = require('@mmckegg/mutant/watch')

const rainbow = require('./lib/rainbow')
const hslToRgb = require('./lib/hsl-to-rgb')
const nightshift = require('./lib/nightshift')
const Spi = require('./lib/spi')
const Client = require('./lib/client')

const stripLength = (60 * 2)
const rate = 100 // fps
const spiOpts = {
  device: '/dev/spidev1.0',
  clockSpeed: null,
  dataMode: null,
  bitOrder: null
}
const wsUrl = 'ws://localhost:1337'

var params = {
  speed: Value(0.5),
  step: Value(1 / stripLength),
  saturation: Value(0.9),
  lightness: Value(0.5),
  nightshift: Value(0.5)
}

window.params = params

const container = document.createElement('div')
container.style.display = 'flex'
container.style.position = 'absolute'
container.style.top = container.style.bottom = container.style.left = container.style.right = 0

for (var i = 0; i < stripLength; i++) {
  var element = document.createElement('div')
  element.style.flex = '1'
  element.style.backgroundColor = 'rgb(0,0,0)'
  container.appendChild(element)
}

document.body.style.height = document.documentElement.style.height = '100%'
document.body.style.margin = document.documentElement.style.margin = 0
document.body.style.padding = document.documentElement.style.padding = 0
document.body.appendChild(container)
document.body.appendChild(h('div', {
  style: {
    height: '100%',
    position: 'relative'
  }
}, [
  h('div', {
    style: {
      height: '100%',
      color: 'white',
      display: 'flex',
      'flex-direction': 'column',
      'justify-content': 'center',
    }
  }, [
    Slider(params.speed, { title: 'Speed', max: 1 }),
    HueStepSlider(params.step, { title: 'Hue Step', max: 256 }),
    Slider(params.saturation, { title: 'Saturation', max: 1 }),
    Slider(params.lightness, { title: 'Lightness', max: 1 }),
    Slider(params.nightshift, { title: 'Nightshift', max: 1 })
  ])
]))

var state = Strand(stripLength)

var spi
try {
  spi = Spi(spiOpts)
} catch (err) {
  console.error(err)
}

var client
try {
  client = Client(wsUrl)
} catch (err) {
  console.error(err)
}

var t = 0
function tick () {
  const speed = params.speed()
  if (speed === 0) return
  t += (speed * speed) / 100

  rainbow(params, t, state)

  hslToRgb(state)
  const shift = params.nightshift()
  nightshift(shift, state)

  preview(container, state)

  if (spi) spi(state)
  if (client) client(state)
}

workerTimer.setInterval(tick, 1000 / rate)

function preview (container, state) {
  for (var i = 0; i < state.shape[0]; i++) {
    const colorString = `rgb(${state.get(i, 0)}, ${state.get(i, 1)}, ${state.get(i, 2)})`
    container.childNodes[i].style.backgroundColor = colorString
  }
}

function Strand (length) {
  return NdArray(new Float64Array(length * 3), [length, 3])
}

function Slider (obs, opts) {
  return h('div', {
    style: {
      'flex-grow': 1,
      display: 'flex',
      'flex-direction': 'column',
      'align-items': 'center',
      padding: '1rem'
    }
  }, [
    h('strong', opts.title), h('br'),
    h('input', {
      type: 'range',
      min: 0,
      step: 0.01,
      max: opts.max,
      hooks: [
        ValueHook(obs)
      ],
      style: {
        'flex-grow': 1,
        width: '100%'
      }
    })
  ])
}

function HueStepSlider (obs, opts) {
  var logObs = Value(0)

  logObs(function (value) {
    obs.set(getValue(value))
  })

  return Slider(logObs, opts)

  function getValue (value) {
    const op = (1 + Math.log(opts.max * opts.max) - Math.log((opts.max - value) * opts.max + 1))
    return 1 / (stripLength * op)
  }
}

function ValueHook (obs) {
  var defaultValue = obs()
  return function (element) {
    element.oninput = function () {
      obs.set(parseFloat(element.value))
    }
    element.ondblclick = function () {
      element.value = defaultValue
      obs.set(defaultValue)
    }
    return watch(obs, function (value) {
      element.value = value
    })
  }
}
