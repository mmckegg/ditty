var Ditty = require('./')
var Bopper = require('bopper')

var audioContext = new AudioContext()
var scheduler = Bopper(audioContext)

var ditty = Ditty()

// prevent scheduler from being garbage collected
window.scheduler = scheduler

scheduler.pipe(ditty).on('data', function(data){
  // data: id, event (start or stop), time, position, args
  if (data.event == 'start'){
    noteOn(data.time, data.id, data.args[0])
  } else if (data.event == 'stop') {
    noteOff(data.time, data.id)
  }
})

var notes = {
  'C': 60,
  'F': 65,
  'G': 67,
  'A': 69
}

ditty.set('C', [
  [0.0, 0.4, 1],
  [1.0, 0.4, 1]
], 8)

ditty.set('F', [
  [2.0, 0.4, 1],
  [3.0, 0.4, 1],
  [5.5, 0.4, 1],
  [6.5, 0.4, 1],
  [7.0, 0.4, 1],
  [7.5, 0.4, 1],
], 8)

ditty.set('G', [
  [4.0, 0.4, 1],
  [5.0, 0.4, 1]
], 8)

// mixer
var output = audioContext.createGain()
output.gain.value = 0.5
output.connect(audioContext.destination)

// simple oscillating synth
var onNotes = {}
function noteOn(time, id, velocity){
  //console.log('on', time, id)
  noteOff(time, id) // choke existing note if any
  var oscillator = audioContext.createOscillator()
  oscillator.connect(output)
  oscillator.frequency.value = getFrequency(notes[id])
  oscillator.type = 2
  oscillator.start(time)
  onNotes[id] = oscillator
}
function noteOff(time, id){
  if (onNotes[id]){
    //console.log('off', time, id)
    onNotes[id].stop(time)
    onNotes[id] = null
  }
}
function getFrequency(midiNote){
  return 440 * Math.pow(2, (midiNote - 69) / 12)
}

scheduler.setTempo(120)
setTimeout(function(){
  scheduler.start()
}, 3000)
