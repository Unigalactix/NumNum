import test from 'node:test'
import assert from 'node:assert/strict'
import { playGoldieBark } from './goldieSound.js'

test('Goldie creates two short, bounded woofs and releases its audio context', async () => {
  const previousWindow = globalThis.window
  const oscillators = []
  const levels = []
  let closed = false
  const parameter = () => ({
    setValueAtTime() {},
    exponentialRampToValueAtTime() {},
    linearRampToValueAtTime(value) { levels.push(value) },
  })
  class AudioContext {
    state = 'running'
    currentTime = 10
    destination = {}
    async resume() {}
    async close() { closed = true }
    createOscillator() {
      const oscillator = {
        frequency: parameter(),
        connect() {},
        start(time) { this.started = time },
        stop(time) { this.stopped = time },
      }
      oscillators.push(oscillator)
      return oscillator
    }
    createBiquadFilter() { return { frequency: parameter(), Q: {}, connect() {} } }
    createGain() { return { gain: parameter(), connect() {} } }
  }
  globalThis.window = { AudioContext }
  try {
    await playGoldieBark()
    assert.equal(oscillators.length, 2)
    assert.ok(oscillators.every(({ started, stopped }) => stopped - started < 0.23))
    assert.ok(levels.every((level) => level <= 0.16))
    assert.equal(closed, true)
  } finally {
    globalThis.window = previousWindow
  }
})

test('unsupported audio is reported rather than pretending a bark played', async () => {
  const previousWindow = globalThis.window
  globalThis.window = {}
  try {
    await assert.rejects(playGoldieBark(), /does not support in-page audio/)
  } finally {
    globalThis.window = previousWindow
  }
})
