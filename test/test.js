var Ditty = require('../')

var test = require('tape')

test(function(t){
  var ditty = Ditty()
  ditty.set(60, [ // midi C
    [0, 0.9], [1, 0.9]
  ], 8)
  ditty.set(65, [ // midi F
    [2.0, 0.9], [3.0, 0.9], [5.5, 0.4], [6.5, 0.4], [7.0, 0.4], [7.5, 0.4],
  ], 8)
  ditty.set(67, [ // midi G
    [4.0, 0.4], [5.0, 0.4]
  ], 8)

  t.same(testSchedule(ditty, {
    from: 0, to: 1, time: 0, beatDuration: 1
  }), [ 
    { id: 60, event: 'start', position: 0, args: [], time: 0 } 
  ])

  t.same(testSchedule(ditty, {
    from: 6+8, to: 8+8, time: 6+8, beatDuration: 1
  }), [ 
    { args: [], event: 'stop', id: 60, position: 0.9, time: 0.9000000000000004 }, 
    { args: [], event: 'start', id: 65, position: 14.5, time: 14.5 }, 
    { args: [], event: 'stop', id: 65, position: 14.9, time: 14.9 }, 
    { args: [], event: 'start', id: 65, position: 15, time: 15 }, 
    { args: [], event: 'stop', id: 65, position: 15.4, time: 15.4 }, 
    { args: [], event: 'start', id: 65, position: 15.5, time: 15.5 } 
  ])

  // test immediate terminate loop removed
  ditty.set(65, null)

  t.same(testSchedule(ditty, {
    from: 6, to: 7, time: 6, beatDuration: 1
  }), [
    { args: [], event: 'stop', id: 65, position: 15.9, time: 6 }
  ])

  t.end()
})


function testSchedule(ditty, schedule){
  var results = []
  function collect(data){
    results.push(data)
  }
  ditty.on('data', collect)
  ditty.write(schedule)
  ditty.removeListener('data', collect)
  return results
}