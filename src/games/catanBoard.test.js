import assert from 'node:assert/strict'
import test from 'node:test'
import { BOARD, RESOURCES, act, botAction, citySites, newMatch, roadSites, score, settlementSites, tradeRate } from './catanBoard.js'

const seats = (count) => Array.from({ length: count }, (_, index) => ({ id: `player-${index}`, name: `Player ${index}`, isBot: true }))

test('island topology, terrain and ports have the expected counts', () => {
  assert.equal(BOARD.tiles.length, 19)
  assert.equal(BOARD.vertices.length, 54)
  assert.equal(BOARD.edges.length, 72)
  assert.equal(BOARD.ports.length, 9)
  assert.deepEqual(Object.fromEntries([...RESOURCES, 'desert'].map((resource) => [resource, BOARD.tiles.filter((tile) => tile.resource === resource).length])), { wood: 4, brick: 3, sheep: 4, wheat: 4, ore: 3, desert: 1 })
  assert.deepEqual([...new Set(BOARD.tiles.map((tile) => tile.y))].map((row) => BOARD.tiles.filter((tile) => tile.y === row).length), [3, 4, 5, 4, 3])
  assert.equal(new Set(BOARD.ports.flatMap((port) => port.ends)).size, 18)
})

test('two, three and four seats start with spaced corner settlements and connected roads', () => {
  for (const count of [2, 3, 4]) {
    const match = newMatch(seats(count))
    assert.equal(Object.keys(match.buildings).length, count * 2)
    assert.equal(Object.keys(match.roads).length, count * 2)
    for (const [id, building] of Object.entries(match.buildings)) {
      const vertex = BOARD.vertices[id]
      assert.ok(vertex.edges.some((edge) => match.roads[edge] === building.owner))
      for (const edge of vertex.edges) for (const end of BOARD.edges[edge].ends) if (end !== vertex.id) assert.equal(match.buildings[end], undefined)
    }
  }
})

test('roads cost resources, respect connectivity, and cannot be built before rolling', () => {
  const match = newMatch(seats(2))
  const site = roadSites(match, 0)[0]
  assert.equal(act(match, { type: 'road', id: site.id }), match)
  const rolled = act(match, { type: 'roll' }, () => .2)
  const before = structuredClone(rolled)
  const built = act(rolled, { type: 'road', id: site.id })
  assert.equal(built.roads[site.id], 0)
  assert.equal(built.hands[0].wood, rolled.hands[0].wood - 1)
  assert.equal(built.hands[0].brick, rolled.hands[0].brick - 1)
  assert.deepEqual(rolled, before)
  const disconnected = BOARD.edges.find((edge) => !roadSites(rolled, 0).some((legal) => legal.id === edge.id) && rolled.roads[edge.id] === undefined)
  assert.equal(act(rolled, { type: 'road', id: disconnected.id }), rolled)
})

test('cities upgrade corners and produce twice the adjacent resource', () => {
  const match = newMatch(seats(2))
  match.phase = 'build'
  match.hands[0].ore = 3
  const site = citySites(match, 0)[0]
  const upgraded = act(match, { type: 'city', id: site.id })
  assert.equal(score(upgraded, 0), 3)
  assert.equal(upgraded.buildings[site.id].level, 2)
  assert.equal(upgraded.hands[0].ore, 0)
  const tile = BOARD.tiles[site.tiles.find((id) => BOARD.tiles[id].number)]
  const isolated = { ...upgraded, buildings: { [site.id]: { owner: 0, level: 2 } }, phase: 'roll' }
  const first = Math.min(6, tile.number - 1)
  const second = tile.number - first
  const rolls = [(first - .5) / 6, (second - .5) / 6]
  let index = 0
  const produced = act(isolated, { type: 'roll' }, () => rolls[index++])
  const expected = site.tiles.filter((id) => BOARD.tiles[id].number === tile.number && BOARD.tiles[id].resource === tile.resource).length * 2
  assert.equal(produced.hands[0][tile.resource], isolated.hands[0][tile.resource] + expected)
})

test('ports improve exchange rates only for adjacent owners', () => {
  const match = newMatch(seats(2))
  match.buildings = {}
  assert.equal(tradeRate(match, 0, 'wood'), 4)
  const generic = BOARD.ports.find((port) => port.resource === null)
  match.buildings[generic.ends[0]] = { owner: 0, level: 1 }
  assert.equal(tradeRate(match, 0, 'wood'), 3)
  const wood = BOARD.ports.find((port) => port.resource === 'wood')
  match.buildings[wood.ends[0]] = { owner: 0, level: 1 }
  assert.equal(tradeRate(match, 0, 'wood'), 2)
  assert.equal(tradeRate(match, 1, 'wood'), 4)
  match.phase = 'build'
  const traded = act(match, { type: 'trade', from: 'wood', to: 'ore' })
  assert.equal(traded.hands[0].wood, 0)
  assert.equal(traded.hands[0].ore, 3)
})

test('seven blocks the turn until robber movement and prevents same-tile placement', () => {
  const match = newMatch(seats(2))
  const rolls = [.4, .55]
  const rolled = act(match, { type: 'roll' }, () => rolls.length ? rolls.shift() : .1)
  assert.equal(rolled.phase, 'robber')
  assert.equal(act(rolled, { type: 'end' }), rolled)
  assert.equal(act(rolled, { type: 'robber', id: rolled.robber }), rolled)
  assert.equal(rolled.hands[0].wood + rolled.hands[0].brick + rolled.hands[0].sheep + rolled.hands[0].wheat + rolled.hands[0].ore, 5)
  const moved = act(rolled, { type: 'robber', id: 0 }, () => .1)
  assert.equal(moved.robber, 0)
  assert.equal(moved.phase, 'build')
})

test('bots preserve legal pieces, spacing and nonnegative hands through long matches', () => {
  let seed = 417
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
  for (const count of [2, 3, 4]) {
    let match = newMatch(seats(count))
    for (let step = 0; step < 1500 && match.winner === null; step++) {
      const previous = match
      match = act(match, botAction(match), random)
      assert.notEqual(match, previous)
      for (const hand of match.hands) for (const value of Object.values(hand)) assert.ok(Number.isInteger(value) && value >= 0)
      for (const vertex of settlementSites(match, match.current)) assert.equal(match.buildings[vertex.id], undefined)
    }
    for (const owner of match.players.keys()) assert.ok(Object.values(match.roads).filter((value) => value === owner).length <= 15)
  }
})