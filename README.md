ditty
===

Schedule a looped sequence of [Web Audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) events using [bopper](https://github.com/mmckegg/bopper) clock source.

**BREAKING CHANGES:** The API has changed significantly in the version 2 release. Now supports multiple loop channels with differing lengths.

## Install via [npm](https://npmjs.org/packages/ditty)

```bash
$ npm install ditty
```

## API

```
var Ditty = require('ditty')
var ditty = Ditty()
```

### Ditty()

Creates a realtime-transform stream. Pipe in [schedule events](https://github.com/mmckegg/bopper) and stream out the looped events added to the input `schedule.time`.

```js
var Bopper = require('bopper')
var audioContext = new AudioContext()
var scheduler = Bopper(audioContext)

schedule.pipe(ditty).on('data', function(data){
  // data: id, event (start or stop), time, position, args
  if (data.event == 'start'){
    noteOn(data.id, data.time)
  } else if (data.event == 'stop'){
    noteOff(data.id, data.time)
  }
})
```

**Input:**

```js
{
  from: 0,
  to: 1.0,
  time: audioContext.currentTime,
  beatLength: tempo / 60
}
``

**Output:**

```js
{
  id: 'C',
  position: 0.5, // preserved from ditty.set
  event: 'start', // or 'stop' for the off note
  time: schedule.time + delta
}
```

### ditty.set(id, events[, loopLength=8])

Schedule a set of start/stop `events` for the given `id`. This will override any loop already set on this `id`.

**`events` is an array of arrays:**

```js
[
  [beatPosition, length, args...],
  [beatPosition, length, args...],
  ...
]
```

```js
// schedule a C -> F -> G -> F midi sequence

ditty.set(60, [ // midi C
  [0, 0.9], [1, 0.9]
], 8)

ditty.set(65, [ // midi F
  [2.0, 0.9], [3.0, 0.9], [5.5, 0.4], [6.5, 0.4], [7.0, 0.4], [7.5, 0.4],
], 8)

ditty.set(67, [ // midi G
  [4.0, 0.4], [5.0, 0.4]
], 8)
```

### ditty.get(id)

Returns the event sequence as `set`.

### ditty.getLength(id)

Returns the `loopLength` as specified for `set`.

### ditty.getDescriptors()

Returns an array of objects describing the state of all loops.

### ditty.update(descriptor)

Push a loop descriptor in to restore the state of the given loop at `descriptor.id`.

### ditty.on('change', function(descriptor))

Whenever a loop is updated, the `'change'` event is emitted with the new loop descriptor (`id`, `events`, `length`).

## Example

To run the example `npm install && npm install --global beefy` then `beefy example.js` and navigate to `http://localhost:9966/`