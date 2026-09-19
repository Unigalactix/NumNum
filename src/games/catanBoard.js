import { defineHex, Orientation } from 'honeycomb-grid'

export const RESOURCES = ['wood', 'brick', 'sheep', 'wheat', 'ore']
export const COSTS = {
  road: { wood: 1, brick: 1 },
  settlement: { wood: 1, brick: 1, sheep: 1, wheat: 1 },
  city: { wheat: 2, ore: 3 },
}

const BoardHex = defineHex({ dimensions: 52, orientation: Orientation.POINTY, origin: { x: 0, y: 0 } })
const terrain = ['wood', 'sheep', 'wheat', 'brick', 'ore', 'wood', 'sheep', 'wheat', 'brick', 'desert', 'ore', 'wood', 'wheat', 'sheep', 'brick', 'ore', 'wheat', 'sheep', 'wood']
const tokens = [6, 3, 8, 2, 5, 10, 9, 12, 11, null, 4, 8, 10, 9, 4, 5, 3, 11, 6]

function createBoard() {
  const vertices = []
  const edges = []
  const tiles = []
  const vertexKeys = new Map()
  const edgeKeys = new Map()
  for (let row = -2; row <= 2; row++) {
    for (let column = Math.max(-2, -row - 2); column <= Math.min(2, -row + 2); column++) {
      const hex = new BoardHex({ q: column, r: row })
      const tileId = tiles.length
      const corners = hex.corners.map((point) => {
        const key = `${point.x.toFixed(3)},${point.y.toFixed(3)}`
        if (!vertexKeys.has(key)) {
          vertexKeys.set(key, vertices.length)
          vertices.push({ id: vertices.length, x: point.x + 350, y: point.y + 310, tiles: [], edges: [] })
        }
        const vertex = vertices[vertexKeys.get(key)]
        vertex.tiles.push(tileId)
        return vertex.id
      })
      corners.forEach((start, index) => {
        const end = corners[(index + 1) % 6]
        const key = [start, end].sort((left, right) => left - right).join(',')
        if (!edgeKeys.has(key)) {
          const id = edges.length
          edgeKeys.set(key, id)
          edges.push({ id, ends: [start, end], tiles: [] })
          vertices[start].edges.push(id)
          vertices[end].edges.push(id)
        }
        edges[edgeKeys.get(key)].tiles.push(tileId)
      })
      tiles.push({ id: tileId, x: hex.x + 350, y: hex.y + 310, corners, resource: terrain[tileId], number: tokens[tileId] })
    }
  }
  const coast = edges.filter((edge) => edge.tiles.length === 1).sort((left, right) => {
    const angle = (edge) => Math.atan2(vertices[edge.ends[0]].y + vertices[edge.ends[1]].y - 620, vertices[edge.ends[0]].x + vertices[edge.ends[1]].x - 700)
    return angle(left) - angle(right)
  })
  const portTypes = [null, 'wood', null, 'brick', 'sheep', null, 'wheat', null, 'ore']
  const ports = portTypes.map((resource, index) => ({ ...coast[Math.floor(index * coast.length / 9)], resource }))
  return { tiles, vertices, edges, ports }
}

export const BOARD = createBoard()
export const affordable = (hand, type) => Object.entries(COSTS[type]).every(([resource, count]) => hand[resource] >= count)
export const score = (match, owner) => Object.values(match.buildings).filter((building) => building.owner === owner).reduce((total, building) => total + building.level, 0)

export function settlementSites(match, owner, setup = false) {
  if (!setup && Object.values(match.buildings).filter((building) => building.owner === owner && building.level === 1).length >= 5) return []
  return BOARD.vertices.filter((vertex) => !match.buildings[vertex.id] && vertex.edges.every((edgeId) => BOARD.edges[edgeId].ends.every((end) => !match.buildings[end])) && (setup || vertex.edges.some((edgeId) => match.roads[edgeId] === owner)))
}

export function roadSites(match, owner) {
  if (Object.values(match.roads).filter((player) => player === owner).length >= 15) return []
  return BOARD.edges.filter((edge) => match.roads[edge.id] === undefined && edge.ends.some((end) => {
    const building = match.buildings[end]
    return building ? building.owner === owner : BOARD.vertices[end].edges.some((edgeId) => match.roads[edgeId] === owner)
  }))
}

export function citySites(match, owner) {
  if (Object.values(match.buildings).filter((building) => building.owner === owner && building.level === 2).length >= 4) return []
  return BOARD.vertices.filter((vertex) => match.buildings[vertex.id]?.owner === owner && match.buildings[vertex.id].level === 1)
}

export function tradeRate(match, owner, resource) {
  return BOARD.ports.reduce((rate, port) => port.ends.some((end) => match.buildings[end]?.owner === owner)
    ? Math.min(rate, port.resource === resource ? 2 : port.resource === null ? 3 : 4) : rate, 4)
}

export function newMatch(players) {
  const match = {
    players, current: 0, phase: 'roll', dice: null, robber: 9, buildings: {}, roads: {},
    hands: players.map(() => Object.fromEntries(RESOURCES.map((resource) => [resource, 2]))),
    log: ['The island is ready. Rajesh begins.'], winner: null,
  }
  const order = [...players.keys(), ...[...players.keys()].reverse()]
  order.forEach((owner) => {
    const handResources = Object.entries(match.buildings).filter(([, building]) => building.owner === owner).flatMap(([id]) => BOARD.vertices[id].tiles.map((tileId) => BOARD.tiles[tileId].resource))
    const value = (vertex) => vertex.tiles.reduce((total, tileId) => {
      const tile = BOARD.tiles[tileId]
      return total + (tile.number ? 6 - Math.abs(7 - tile.number) + (handResources.includes(tile.resource) ? 0 : 2) : 0)
    }, 0)
    const site = settlementSites(match, owner, true).sort((left, right) => value(right) - value(left))[0]
    match.buildings[site.id] = { owner, level: 1 }
    match.roads[site.edges[0]] = owner
  })
  return match
}

export function act(match, action, random = Math.random) {
  if (match.winner !== null) return match
  const next = structuredClone(match)
  const owner = next.current
  const hand = next.hands[owner]
  const name = next.players[owner].name
  let message
  if (action.type === 'roll' && next.phase === 'roll') {
    next.dice = [Math.floor(random() * 6) + 1, Math.floor(random() * 6) + 1]
    const sum = next.dice[0] + next.dice[1]
    next.phase = sum === 7 ? 'robber' : 'build'
    if (sum === 7) {
      next.hands.forEach((cards) => {
        const total = Object.values(cards).reduce((count, value) => count + value, 0)
        if (total <= 7) return
        for (let discard = 0; discard < Math.floor(total / 2); discard++) {
          const held = RESOURCES.flatMap((resource) => Array(cards[resource]).fill(resource))
          cards[held[Math.floor(random() * held.length)]]--
        }
      })
      message = `${name} rolled 7. Large hands discarded at random; move the robber.`
    } else {
      BOARD.tiles.filter((tile) => tile.number === sum && tile.id !== next.robber).forEach((tile) => tile.corners.forEach((corner) => {
        const building = next.buildings[corner]
        if (building) next.hands[building.owner][tile.resource] += building.level
      }))
      message = `${name} rolled ${sum}. Adjacent buildings collected resources.`
    }
  } else if (action.type === 'robber' && next.phase === 'robber' && BOARD.tiles[action.id] && action.id !== next.robber) {
    next.robber = action.id
    const victim = BOARD.tiles[action.id].corners.map((corner) => next.buildings[corner]?.owner).find((player) => player !== undefined && player !== owner && Object.values(next.hands[player]).some(Boolean))
    if (victim !== undefined) {
      const held = RESOURCES.flatMap((resource) => Array(next.hands[victim][resource]).fill(resource))
      const stolen = held[Math.floor(random() * held.length)]
      next.hands[victim][stolen]--
      hand[stolen]++
    }
    next.phase = 'build'
    message = `${name} moved the robber${victim !== undefined ? ` and stole a card from ${next.players[victim].name}` : ''}.`
  } else if (action.type === 'trade' && next.phase === 'build' && RESOURCES.includes(action.from) && RESOURCES.includes(action.to) && action.from !== action.to && hand[action.from] >= tradeRate(next, owner, action.from)) {
    const rate = tradeRate(next, owner, action.from)
    hand[action.from] -= rate
    hand[action.to]++
    message = `${name} traded ${rate} ${action.from} for 1 ${action.to}.`
  } else if (['road', 'settlement', 'city'].includes(action.type) && next.phase === 'build' && affordable(hand, action.type)) {
    const sites = action.type === 'road' ? roadSites(next, owner) : action.type === 'city' ? citySites(next, owner) : settlementSites(next, owner)
    if (!sites.some((site) => site.id === action.id)) return match
    Object.entries(COSTS[action.type]).forEach(([resource, count]) => { hand[resource] -= count })
    if (action.type === 'road') next.roads[action.id] = owner
    else next.buildings[action.id] = { owner, level: action.type === 'city' ? 2 : 1 }
    message = `${name} built a ${action.type}.`
    if (score(next, owner) >= 10) next.winner = owner
  } else if (action.type === 'end' && next.phase === 'build') {
    next.current = (owner + 1) % next.players.length
    next.phase = 'roll'
    message = `${next.players[next.current].name}'s turn.`
  } else return match
  next.log = [message, ...next.log].slice(0, 8)
  return next
}

export function botAction(match) {
  const owner = match.current
  if (match.phase === 'roll') return { type: 'roll' }
  if (match.phase === 'robber') {
    const ranked = BOARD.tiles.filter((tile) => tile.id !== match.robber).sort((left, right) => {
      const value = (tile) => tile.corners.reduce((total, corner) => total + (match.buildings[corner] ? (match.buildings[corner].owner === owner ? -3 : 1) * match.buildings[corner].level : 0), 0)
      return value(right) - value(left)
    })
    return { type: 'robber', id: ranked[0].id }
  }
  const hand = match.hands[owner]
  for (const type of ['city', 'settlement', 'road']) {
    const sites = type === 'city' ? citySites(match, owner) : type === 'settlement' ? settlementSites(match, owner) : roadSites(match, owner)
    if (!sites.length) continue
    if (affordable(hand, type)) return { type, id: sites[0].id }
    const needed = Object.keys(COSTS[type]).find((resource) => hand[resource] < COSTS[type][resource])
    const donor = RESOURCES.find((resource) => resource !== needed && hand[resource] - (COSTS[type][resource] || 0) >= tradeRate(match, owner, resource))
    if (needed && donor) return { type: 'trade', from: donor, to: needed }
  }
  return { type: 'end' }
}