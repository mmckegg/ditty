var Through = require('through')

module.exports = function(){

  var playback = {notes: [], length: 8}

  var onNotes = []
  var turnOffNotes = []

  var undos = []
  var redos = []

  var ditty = Through(function(schedule){
    var events = getRange(schedule.from, schedule.to)
    events.forEach(function(event){
      var time = schedule.time + (event.delta*schedule.beatTime)
      ditty.queue({
        data: event.data, 
        time: time, 
        position: schedule.from+event.delta
      })
    })
  })

  ditty.getNotes = function(){
    return playback.notes
  }

  ditty.getLength = function(){
    return playback.length
  }

  ditty.clear = function(){
    ditty.setNotes([])
  }

  ditty.undo = function(){
    redos.push(playback)
    playback = undos.pop()
  }

  ditty.redo = function(){
    undos.push(playback)
    playback = redos.pop()
  }

  ditty.setNotes = function(notes, length){
    notes = notes || []
    turnOffUnused(notes)
    undos.push(playback)
    playback = {notes: notes, length: length || playback.length}
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
    var events = []

    if (turnOffNotes.length){
      turnOffNotes.forEach(function(note){
        onNotes[note.key] = null
        events.push({data: note.off, delta: 0})
      })
      turnOffNotes = []
    }

    playback.notes.forEach(function(note){
      var position = getAbsolutePosition(note.position, start, playback.length)
      var endPosition = getAbsolutePosition(note.position + note.length, start, playback.length)
      if (position>=start && position<end){
        events.push({data: note.on, delta: position-start})
        onNotes.push(note)
      }
    })

    for (var i=onNotes.length-1;i>=0;i--){
      var note = onNotes[i]
      var endPosition = getAbsolutePosition(note.position + note.length, start, playback.length)
      if (endPosition>=start && endPosition<end){
        events.push({data: note.off, delta: endPosition-start})
        onNotes.splice(i, 1)
      }
    }

    return events
  }


  return ditty
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