ditty
===

Schedule Web Audio events for a midi loop sequence using [bopper](https://github.com/mmckegg/bopper) clock source.

## Install

```bash
$ npm install ditty
```

## Example

```js
var Ditty = require('ditty')
var Bopper = require('bopper')

var audioContext = new webkitAudioContext()
var bopper = Bopper(audioContext)

var ditty = Ditty(bopper)

ditty.on('data', function(event){
  // event: key, data, action, time, position

  if (event.data[2]){
    noteOn(event.time, event.data[1], event.data[2])
  } else {
    noteOff(event.time, event.data[1])
  }

})

var C = 60, F = 65, G = 67, A = 69


ditty.setNotes([
  [144, C, 100, 0.0, 0.9],
  [144, C, 100, 1.0, 0.9],
  [144, F, 100, 2.0, 0.9],
  [144, F, 100, 3.0, 0.9],
  [144, G, 100, 4.0, 0.9],
  [144, G, 100, 5.0, 0.4],
  [144, F, 100, 5.5, 0.9],
  [144, F, 100, 6.5, 0.4],
  [144, F, 100, 7.0, 0.4],
  [144, F, 100, 7.5, 0.4]
], 8)


// simple oscillating synth
var onNotes = {}
function noteOn(time, id, velocity){
  console.log('on', time, id)
  noteOff(time, id) // choke existing note if any
  var oscillator = audioContext.createOscillator()
  oscillator.connect(audioContext.destination)
  oscillator.frequency.value = getFrequency(id)
  oscillator.type = 2
  oscillator.start(time)
  onNotes[id] = oscillator
}
function noteOff(time, id){
  if (onNotes[id]){
    console.log('off', time, id)
    onNotes[id].stop(time)
    onNotes[id] = null
  }
}
function getFrequency(id){
  return 440 * Math.pow(2, (id - 69.0) / 12.0)
}

bopper.setTempo(120)
bopper.start()
```

To run the example `npm install && npm install -g beefy` then `beefy example.js` and navigate to `http://localhost:9966/`