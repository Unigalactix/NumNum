export const JUMPS = { 4: 25, 13: 46, 33: 49, 42: 63, 50: 69, 62: 81, 74: 92, 27: 5, 40: 3, 54: 31, 66: 45, 76: 58, 89: 53, 99: 41 }
export const LUDO_TRACK = [
  [6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],
  [1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],
  [8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],
  [13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0],[6,0],
]
export const LUDO_LANES = [
  [[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
  [[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
  [[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
  [[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
]
export const LUDO_YARDS = [[0,0],[0,9],[9,9],[9,0]]
export const LUDO_COLORS = ['#bb4354', '#368465', '#d29b28', '#397cbb']
export const FINISH = 56

export function newRace(players, game, random = Math.random) {
  const seats = players.map((player, index) => ({ ...player, seat: players.length === 2 ? index * 2 : index, color: LUDO_COLORS[players.length === 2 ? index * 2 : index] }))
  const current = Math.floor(random() * seats.length)
  return { game, players: seats, current, pieces: seats.map(() => [-1,-1,-1,-1]), positions: seats.map(() => 0), die: null, sixes: 0, winner: null, turn: 0, log: `${seats[current].name} starts.`, path: [] }
}

export function trackCell(match, owner, progress) {
  return progress >= 0 && progress <= 50 ? (match.players[owner].seat * 13 + progress) % 52 : null
}

export function ludoCoordinate(match, owner, piece) {
  const progress = match.pieces[owner][piece]
  const seat = match.players[owner].seat
  if (progress < 0) {
    const [row, column] = LUDO_YARDS[seat]
    return [row + 2 + Math.floor(piece / 2) * 2, column + 2 + piece % 2 * 2]
  }
  if (progress > 50) return LUDO_LANES[seat][progress - 51]
  return LUDO_TRACK[trackCell(match, owner, progress)]
}

export function ludoMoves(match) {
  if (!match.die || match.winner !== null) return []
  const owner = match.current
  return match.pieces[owner].flatMap((progress, piece) => {
    if (progress === FINISH || (progress < 0 && match.die !== 6)) return []
    const destination = progress < 0 ? 0 : progress + match.die
    if (destination > FINISH) return []
    for (let step = progress < 0 ? 0 : progress + 1; step <= destination; step++) {
      const cell = trackCell(match, owner, step)
      if (cell === null) continue
      for (let opponent = 0; opponent < match.players.length; opponent++) {
        if (opponent !== owner && match.pieces[opponent].filter((value) => trackCell(match, opponent, value) === cell).length >= 2) return []
      }
    }
    return [piece]
  })
}

function advance(match) {
  match.current = (match.current + 1) % match.players.length
  match.sixes = 0
  match.die = null
  match.turn++
}

export function raceAction(match, action, random = Math.random) {
  if (!match || match.winner !== null) return match
  const next = structuredClone(match)
  const owner = next.current
  const name = next.players[owner].name
  if (action.type === 'roll') {
    if (next.game === 'ludo' && next.die) return match
    const die = Math.floor(random() * 6) + 1
    next.die = die
    next.lastRoll = die
    next.log = `${name} rolled ${die}.`
    if (next.game === 'snakes') {
      const start = next.positions[owner]
      const landed = start + die > 100 ? start : start + die
      const destination = landed === start ? start : JUMPS[landed] || landed
      next.positions[owner] = destination
      next.path = Array.from({ length: landed - start }, (_, index) => start + index + 1)
      if (destination !== landed) next.path.push(destination)
      next.moved = owner
      next.log = landed === start ? `${name} needs an exact roll to finish.` : `${name}: ${start} to ${landed}${destination !== landed ? `, ${destination > landed ? 'climbs' : 'slides'} to ${destination}` : ''}.`
      if (destination === 100) next.winner = owner
      else { next.current = (owner + 1) % next.players.length; next.turn++ }
    } else {
      next.sixes = die === 6 ? next.sixes + 1 : 0
      if (next.sixes === 3) { next.log = `${name}: third six, turn ends.`; advance(next) }
      else if (!ludoMoves(next).length) {
        next.log = `${name} rolled ${die}; no legal move${die === 6 ? ', roll again' : ''}.`
        if (die === 6) next.die = null
        else advance(next)
      }
    }
  } else if (action.type === 'move' && next.game === 'ludo' && ludoMoves(next).includes(action.piece)) {
    const progress = next.pieces[owner][action.piece]
    const destination = progress < 0 ? 0 : progress + next.die
    next.pieces[owner][action.piece] = destination
    const cell = trackCell(next, owner, destination)
    let captured = 0
    if (cell !== null) next.pieces.forEach((pieces, opponent) => {
      if (opponent === owner) return
      pieces.forEach((value, piece) => { if (trackCell(next, opponent, value) === cell) { pieces[piece] = -1; captured++ } })
    })
    next.log = `${name} moved token ${action.piece + 1}${captured ? ' and captured a token' : destination === FINISH ? ' home' : ''}.`
    if (next.pieces[owner].every((value) => value === FINISH)) next.winner = owner
    else if (next.die === 6) next.die = null
    else advance(next)
  } else return match
  return next
}

export function raceBot(match) {
  if (match.game === 'snakes' || !match.die) return { type: 'roll' }
  const moves = ludoMoves(match)
  const value = (piece) => {
    const progress = match.pieces[match.current][piece]
    const destination = progress < 0 ? 0 : progress + match.die
    const cell = trackCell(match, match.current, destination)
    const capture = cell !== null && match.pieces.some((pieces, opponent) => opponent !== match.current && pieces.some((other) => trackCell(match, opponent, other) === cell))
    return (destination === FINISH ? 1000 : capture ? 500 : progress < 0 ? 100 : destination)
  }
  return { type: 'move', piece: moves.sort((left, right) => value(right) - value(left))[0] }
}