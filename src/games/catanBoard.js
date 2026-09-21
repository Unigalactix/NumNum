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

