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
      if (note[3]>=schedule.from && note[3]<schedule.to){
        notes.push(note)
      } else {
        return true
      }
    })

    playback.notes.forEach(function(note){
      var position = getAbsolutePosition(note[3], schedule.from, playback.length)
      if (position>=schedule.from && position<schedule.to){        
        notes.push(noteWithPosition(note, position))
        var offNote = getOffNote(note, position+note[4])
        if (offNote[3]<schedule.to){
          notes.push(offNote)
        } else {
          offNotes.push(offNote)
        }
      }
    })

    notes.sort(compareNotes).forEach(function(note){
      var delta = note[3] - schedule.from
      ditty.queue({
        time: schedule.time + (delta*schedule.beatDuration),
        data: note 
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
    //turnOffUnused()
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

function inRange(note, from, to, length){
  var position = getAbsolutePosition(note[3], from, length)
  return (position>=from && position<to)
}

function compareNotes(a,b){
  return a[3]-b[3] || a[2]-b[2]
}

function getOffNote(note, position){
  return [note[0], note[1], 0, position]
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