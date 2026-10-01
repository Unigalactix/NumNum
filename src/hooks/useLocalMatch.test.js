import test from 'node:test'
import assert from 'node:assert/strict'
import { changeLocalMatch, readLocalMatch, writeLocalMatch } from './useLocalMatch.js'
import { isRaceMatch, newRace, raceAction } from '../games/raceRules.js'
import { isChessMatch, restoreChess } from '../games/chessRules.js'

function memoryStorage() {
  const values = new Map()
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
}
const players = [{ id: 'rajesh', name: 'Rajesh', isBot: false }, { id: 'neha', name: 'Neha', isBot: false }]

test('local matches round-trip with independent game/version keys and explicit resets', () => {
  const storage = memoryStorage()
  const getStorage = () => storage
  const key = 'numnum-match-ludo-v2'
  const validate = match => isRaceMatch(match, 'ludo')
  const match = raceAction(newRace(players, 'ludo', () => 0), { type: 'roll' }, () => .99)
  assert.equal(writeLocalMatch(key, match, getStorage), null)
  assert.deepEqual(readLocalMatch(key, null, validate, getStorage), { value: match, error: null })
  assert.equal(readLocalMatch('numnum-match-snakes-v2', null, validate, getStorage).value, null)
  assert.equal(readLocalMatch('numnum-match-ludo-v1', null, validate, getStorage).value, null)
  writeLocalMatch(key, null, getStorage)
  assert.deepEqual(readLocalMatch(key, null, validate, getStorage), { value: null, error: null })
})

test('bad JSON, wrong shapes and illegal chess history recover visibly without overwriting the save', context => {
  const logged = context.mock.method(console, 'error', () => {})
  const storage = memoryStorage()
  const initial = () => ({ moves: [], result: null })
  for (const saved of ['{broken', 'null', '{}', '{"moves":["e4","e5","e9"],"result":null}', '{"moves":[],"result":"made up"}']) {
    storage.setItem('chess', saved)
    const restored = readLocalMatch('chess', initial, isChessMatch, () => storage)
    assert.deepEqual(restored.value, initial())
    assert.match(restored.error, /could not be restored/)
    assert.equal(storage.getItem('chess'), saved)
  }
  assert.equal(logged.mock.callCount(), 5)
})

test('denied reads and quota failures are surfaced and in-memory play continues', context => {
  context.mock.method(console, 'error', () => {})
  const denied = () => { throw new Error('Storage disabled') }
  assert.match(readLocalMatch('race', null, () => true, denied).error, /could not be restored/)
  const before = { key: 'race', value: newRace(players, 'snakes', () => 0), error: null }
  const full = () => ({ setItem() { throw new Error('Quota exceeded') } })
  const failed = changeLocalMatch(before, 'race', match => raceAction(match, { type: 'roll' }, () => 0), before.value, full)
  assert.equal(failed.value.positions[0], 1)
  assert.match(failed.error, /could not be saved/)
  const storage = memoryStorage()
  const recovered = changeLocalMatch(failed, 'race', match => raceAction(match, { type: 'roll' }, () => 0), failed.value, () => storage)
  assert.equal(recovered.error, null)
  assert.deepEqual(JSON.parse(storage.getItem('race')), recovered.value)
})

test('duplicate taps and stale callbacks cannot play the next turn or overwrite another game', () => {
  const storage = memoryStorage()
  const before = { key: 'race', value: newRace(players, 'snakes', () => 0), error: null }
  const roll = match => raceAction(match, { type: 'roll' }, () => 0)
  const after = changeLocalMatch(before, 'race', roll, before.value, () => storage)
  assert.equal(after.value.current, 1)
  assert.equal(changeLocalMatch(after, 'race', roll, before.value, () => storage), after)
  assert.equal(changeLocalMatch(after, 'old-key', roll, after.value, () => storage), after)
  assert.equal(changeLocalMatch(after, 'race', value => value, after.value, () => { throw new Error('No-op must not write') }), after)
})

test('duplicate chess moves are rejected before replaying them', () => {
  const storage = memoryStorage()
  const before = { key: 'chess', value: { moves: [], result: null }, error: null }
  const play = current => {
    const game = restoreChess(current.moves)
    game.move('e4')
    return { moves: game.history(), result: null }
  }
  const after = changeLocalMatch(before, 'chess', play, before.value, () => storage)
  assert.equal(changeLocalMatch(after, 'chess', play, before.value, () => storage), after)
  assert.deepEqual(after.value.moves, ['e4'])
})
