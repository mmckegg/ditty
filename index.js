var Through = require('through')

module.exports = function(clock){

  var playback = {notes: [], length: 8}

  var offNotes = []
  var onNotes = []

  var immediateNotes = []


  clock.on('data', function(schedule){

    if (immediateNotes.length){
      immediateNotes.forEach(function(note){
        ditty.queue({
          time: schedule.time,
          data: noteWithPosition(note, schedule.from)
        })
      })
      immediateNotes = []
    }

    var notes = []

    offNotes = offNotes.filter(function(note){
      if (inRange(note, schedule.from, schedule.to, playback.length)){
        notes.push(note)
      } else {
        return true
      }
    })

    playback.notes.forEach(function(note){
      if (inRange(note, schedule.from, schedule.to, playback.length)){
        offNotes.push(offNote(note))
        notes.push(note)
      }
    })


    notes.sort(compareNotes).forEach(function(note){
      var position = getAbsolutePosition(note[3], schedule.from, playback.length)
      var delta = position - schedule.from
      ditty.queue({
        time: schedule.time + (delta*schedule.beatDuration),
        data: noteWithPosition(note, schedule.from+delta)
      })
    })

  })

  var ditty = Through(function(data){
    ditty.setPlayback(data.notes, data.length)
  })

  ditty.getPlayback = function(){
    return playback
  }

  ditty.clear = function(){
    ditty.setPlayback([])
  }

  ditty.setPlayback = function(notes, length){
    notes = notes || []
    playback = {notes: notes, length: length || playback.length}
    turnOffUnused()
    ditty.emit('change')
  }

  ditty.turnOffAllNotes = function(){
    immediateNotes = offNotes
    offNotes = []
  }

  function turnOffUnused(notes){
    offNotes = offNotes.filter(function(note){
      if (hasNote(note)){
        return true
      } else {
        immediateNotes.push(note)
      }
    })
  }

  function hasNote(a){
    return playback.notes.some(function(b){ 
      return isNote(a,b) 
    })
  }

  return ditty
}

//function onNote(note){
//  return [note[0], note[1], note[2], note[3]]
//}

function inRange(note, from, to, length){
  var position = getAbsolutePosition(note[3], from, length)
  return (position>=from && position<to)
}

function compareNotes(a,b){
  return a[3]-b[3] || a[2]-b[2]
}

function offNote(note){
  return [note[0], note[1], 0, note[3] + note[4]]
}

function noteWithPosition(note, position){
  return [note[0], note[1], note[2], position]
}

function isNote(a, b){
  return a[0] == b[0] && a[1] == b[1]
}

function getAbsolutePosition(pos, start, length){
  pos = pos % length

  var micro = start % length
  var position = start+pos-micro

  if (position < start){
    return position + length
  } else {
    return position
  }
}