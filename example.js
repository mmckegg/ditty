var audioContext = new webkitAudioContext()
var bopper = require('bopper')(audioContext)
var ditty = require('./')()

bopper.pipe(ditty).on('data', function(event){
  // event: key, data, action, time, position

  if (event.action == 'on') noteOn(event.time, event.key)
  if (event.action == 'off') noteOff(event.time, event.key)
})

var onNotes = {}
function noteOn(time, id){
  noteOff(time, id) // choke existing note if any
  var oscillator = audioContext.createOscillator()
  oscillator.connect(audioContext.destination)
  oscillator.frequency.value = frequencies[id]
  oscillator.type = 2
  oscillator.start(time)
  onNotes[id] = oscillator
}
function noteOff(time, id){
  if (onNotes[id]){
    onNotes[id].stop(time)
    onNotes[id] = null
  }
}

var frequencies = {
  'C4': 261.626,
  'F4': 349.228,
  'G4': 391.995,
  'A4': 440
}

ditty.setNotes([
  {key: 'C4', position: 0.0, length: 0.9, data: 'some value'},
  {key: 'C4', position: 1.0, length: 0.9},
  {key: 'F4', position: 2.0, length: 0.9},
  {key: 'F4', position: 3.0, length: 0.9},
  {key: 'G4', position: 4.0, length: 0.9},
  {key: 'G4', position: 5.0, length: 0.4},
  {key: 'F4', position: 5.5, length: 0.9},
  {key: 'F4', position: 6.5, length: 0.4},
  {key: 'F4', position: 7.0, length: 0.4},
  {key: 'F4', position: 7.5, length: 0.4} 
], 8)

bopper.setTempo(120)
setTimeout(function(){
  bopper.start()
}, 500)
