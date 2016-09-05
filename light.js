const NdArray = require('ndarray')
const workerTimer = require('worker-timer')
const Value = require('@mmckegg/mutant/value')
const Struct = require('@mmckegg/mutant/struct')
const h = require('@mmckegg/mutant/html-element')
const watch = require('@mmckegg/mutant/watch')
const computed = require('@mmckegg/mutant/computed')

const LogValue = require('./lib/log-value')
const rainbow = require('./lib/rainbow')
const hslToRgb = require('./lib/hsl-to-rgb')
const nightshift = require('./lib/nightshift')
const Spi = require('./lib/spi')
const Ws = require('./lib/ws')

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
  step: Value(0),
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
    Slider(params.speed, { title: 'Speed', maxInput: 1 }),
    //HueStepSlider(params.step, { title: 'Hue Step', maxInput: 256 }),
    CustomSlider(params.step, {
      title: 'Hue Step',
      map: (options) => {
        const logValue = LogValue(options)
        return p => 1 / (stripLength * logValue(p))
      },
      minInput: 0,
      maxInput: 1,
      minOutput: 1,
      maxOutput: 16
    }),
    Slider(params.saturation, { title: 'Saturation', maxInput: 1 }),
    Slider(params.lightness, { title: 'Lightness', maxInput: 1 }),
    CustomSlider(params.nightshift, {
      title: 'Nightshift',
      map: (options) => {
        const logValue = LogValue(options)
        const defaultP = logValue(params.nightshift())
        return p => [defaultP, logValue(1 - p)]
      },
      minInput: 0,
      maxInput: 1,
      minOutput: 1e3,
      maxOutput: 60e3
    })
  ])
]))

var state = Strand(stripLength)

var spi = Spi(spiOpts)

var ws = Ws(wsUrl)

var t = 0
function tick () {
  const speed = params.speed()
  if (speed === 0) return
  t += (speed * speed) / 100

  rainbow(params, t, state)

  hslToRgb(state)
  const shift = params.nightshift()
  nightshift(shift[0], shift[1], state)

  preview(container, state)

  spi(state)
  ws(state)
}

workerTimer.setInterval(tick, 1000 / rate)

function preview (container, state) {
  for (var i = 0; i < state.shape[0]; i++) {
    const colorString = `rgb(${Math.round(state.get(i, 0), 2)}, ${Math.round(state.get(i, 1), 2)}, ${Math.round(state.get(i, 2), 2)})`
    container.childNodes[i].style.backgroundColor = colorString
  }
}

function Strand (length) {
  return NdArray(new Float64Array(length * 3), [length, 3])
}

function CustomSlider (obs, options) {
  const map = options.map(options)
  const nextObs = Value(obs())
  obs.set(map(obs()))
  nextObs(value => obs.set(map(value)))
  return Slider(nextObs, options)
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
      min: opts.minInput || 0,
      step: 0.01,
      max: opts.maxInput || 1,
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
