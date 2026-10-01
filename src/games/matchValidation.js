export const integerIn = (value, min, max = Number.MAX_SAFE_INTEGER) => Number.isInteger(value) && value >= min && value <= max
export const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value)
export const playerIndex = (value, players) => integerIn(value, 0, players.length - 1)

export function validPlayers(players, minimum = 2) {
  return Array.isArray(players) && integerIn(players.length, minimum, 4)
    && players.every(player => isRecord(player)
      && ['string', 'number'].includes(typeof player.id)
      && typeof player.name === 'string' && player.name.length > 0
      && typeof player.isBot === 'boolean')
    && new Set(players.map(player => player.id)).size === players.length
}
