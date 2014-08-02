module.exports = Ditty

var Stream = require('stream')
var inherits = require('util').inherits

function Ditty(){

  if (!(this instanceof Ditty)){
    return new Ditty()
  }

  Stream.call(this)

  this.readable = true
  this.writable = true

  this._state = {
    loops: {},
    lengths: {},
    ids: [],
    queue: []
  }
}

inherits(Ditty, Stream)

var proto = Ditty.prototype

proto.set = function(id, events, length){
  var state = this._state
  if (events){
    if (!state.loops[id]){
      state.ids.push(id)
    }
    state.loops[id] = events
    state.lengths[id] = length || 8
  } else {
    var index = ids.indexOf(id)
    if (~index){
      ids.splice(index, 1)
    }
    state.loops[id] = null
  }
  this.emit('change', id)
}

proto.get = function(id){
  return this._state.loops[id]
}

proto.getLength = function(id){
  return this._state.lengths[id]
}

proto.push = function(data){
  this.emit('data', data)
}

proto.write = function(obj){
  this._transform(obj)
}

proto._transform = function(obj){
  var state = this._state
  var from = obj.from
  var to = obj.to
  var time = obj.time
  var endTime = obj.time + obj.duration
  var beatDuration = obj.beatDuration
  var ids = state.ids
  var queue = state.queue
  var localQueue = []

  for (var i=queue.length-1;i>=0;i--){
    var item = queue[i]
    if (to > item.position){
      var delta = (item.position - from) * beatDuration
      item.time = time + delta
      queue.splice(i, 1)
      this.push(item)
    }
  }

  for (var i=0;i<ids.length;i++){

    var id = ids[i]
    var events = state.loops[id]
    var loopLength = state.lengths[id]

    for (var j=0;j<events.length;j++){

      var event = events[j]
      var startPosition = getAbsolutePosition(event[0], from, loopLength)
      var endPosition = startPosition + event[1]

      if (startPosition >= from && startPosition < to){

        var delta = (startPosition - from) * beatDuration
        var duration = event[1] * beatDuration
        var startTime = time + delta
        var endTime = startTime + duration
        
        localQueue.push({
          id: id,
          event: 'start',
          position: startPosition,
          args: event.slice(4),
          time: startTime
        })

        localQueue.push({
          id: id,
          event: 'stop',
          position: endPosition,
          args: event.slice(4),
          time: endTime
        })

      }
    }
  }

  // ensure events stream in time sequence
  localQueue.sort(compare)
  for (var i=0;i<localQueue.length;i++){
    var item = localQueue[i]
    if (endTime > item.time){
      this.push(item)
    } else {
      // queue event for later
      queue.push(item)
    }
  }

  //cb()
}

function compare(a,b){
  return a.time-b.time
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