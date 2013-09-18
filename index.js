var Through = require('through')

module.exports = function(clock){

  var playback = {notes: [], length: 8}

  var onNotes = []
  var turnOffNotes = []

  clock.on('data', function(schedule){
    var events = getRange(schedule.from, schedule.to)
    events.forEach(function(event){
      var time = schedule.time + (event.delta*schedule.beatDuration)
      ditty.queue({
        time: time,
        data: noteWithPosition(event.data, schedule.from+event.delta)
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
    turnOffUnused(notes)
    playback = {notes: notes, length: length || playback.length}
    ditty.emit('change')
  }

  ditty.turnOffAllNotes = function(){
    turnOffUnused()
  }

  function turnOffUnused(notes){
    onNotes.forEach(function(note){
      if (!notes || !notes.some(function(n){ return n.key == note.key })){
        turnOffNotes.push(note)
      }
    })
  }

  function getRange(start, end){
    var notes = []

    if (turnOffNotes.length){
      turnOffNotes.forEach(function(note){
        notes.push({delta: 0, data: offNote(note)})
      })
      turnOffNotes = []
    }

    playback.notes.forEach(function(note){
      var position = getAbsolutePosition(note[3], start, playback.length)
      //var endPosition = getAbsolutePosition(note[3] + note[4], start, playback.length)
      if (note[4] && position>=start && position<end){
        notes.push({delta: position-start, data: onNote(note)})
        onNotes.push(note)
      }
    })

    for (var i=onNotes.length-1;i>=0;i--){
      var note = onNotes[i]
      var endPosition = getAbsolutePosition(note[3] + note[4], start, playback.length)
      if (endPosition>=start && endPosition<end){
        notes.push({delta: endPosition-start, data: offNote(note)})
        onNotes.splice(i, 1)
      }
    }

    return notes
  }


  return ditty
}

function onNote(note){
  return [note[0], note[1], note[2], note[3]]
}

function offNote(note){
  return [note[0], note[1], 0, note[3] + note[4]]
}

function noteWithPosition(note, position){
  return [note[0], note[1], note[2], position]
}

function getAbsolutePosition(pos, start, length){
  var micro = start % length
  var position = start+pos-micro

  if (position < start){
    return position + length
  } else {
    return position
  }
}