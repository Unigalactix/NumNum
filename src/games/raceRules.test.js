import test from 'node:test'
import assert from 'node:assert/strict'
import { FINISH, LUDO_TRACK, ludoCoordinate, ludoMoves, newRace, raceAction, raceBot } from './raceRules.js'
const players = Array.from({ length: 4 }, (_, index) => ({ id: index, name: `Player ${index}`, isBot: true }))

test('cross has 52 unique squares and visible yard, lane and finish coordinates', () => {
  assert.equal(new Set(LUDO_TRACK.map(String)).size, 52)
  const match = newRace(players, 'ludo', () => 0)
  for (let owner = 0; owner < 4; owner++) for (let progress = -1; progress <= FINISH; progress++) {
    match.pieces[owner][0] = progress
    assert.equal(ludoCoordinate(match, owner, 0).length, 2)
  }
})
test('entry, bonus six, third six, exact finish and blockades', () => {
  let match = newRace(players, 'ludo', () => 0)
  match = raceAction(match, { type: 'roll' }, () => .99)
  match = raceAction(match, { type: 'move', piece: 0 })
  assert.equal(match.pieces[0][0], 0)
  assert.equal(match.current, 0)
  match = raceAction(match, { type: 'roll' }, () => .99)
  match = raceAction(match, { type: 'move', piece: 0 })
  match = raceAction(match, { type: 'roll' }, () => .99)
  assert.equal(match.current, 1)
  match.current = 0
  match.die = 6
  match.pieces[0] = [55,56,56,56]
  assert.deepEqual(ludoMoves(match), [])
  match.die = 1
  match = raceAction(match, { type: 'move', piece: 0 })
  assert.equal(match.winner, 0)
  match = newRace(players, 'ludo', () => 0)
  match.die = 3
  match.pieces[0][0] = 12
  match.pieces[1] = [1,1,-1,-1]
  assert.deepEqual(ludoMoves(match), [])
})
test('snakes begin off-board, climb and slide at endpoints, and require exact 100', () => {
  let match = newRace(players, 'snakes', () => 0)
  match = raceAction(match, { type: 'roll' }, () => .51)
  assert.equal(match.positions[0], 25)
  match.current = 0
  match.positions[0] = 26
  match = raceAction(match, { type: 'roll' }, () => 0)
  assert.equal(match.positions[0], 5)
  match.current = 0
  match.positions[0] = 98
  match = raceAction(match, { type: 'roll' }, () => .99)
  assert.equal(match.positions[0], 98)
  match.current = 0
  match = raceAction(match, { type: 'roll' }, () => .2)
  assert.equal(match.winner, 0)
})
test('full race bot matches finish for every supported seat count', () => {
  let seed = 73
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
  for (const count of [2,3,4]) for (const game of ['snakes','ludo']) {
    let match = newRace(players.slice(0,count), game, random)
    for (let step = 0; step < 20000 && match.winner === null; step++) match = raceAction(match, raceBot(match), random)
    assert.notEqual(match.winner, null, `${game} ${count} seats`)
  }
})