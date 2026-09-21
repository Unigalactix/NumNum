import { Chess } from 'chess.js'

export function restoreChess(moves = []) {
  const game = new Chess()
  for (const move of moves) game.move(move)
  return game
}

export function repetitionCount(game) {
  const replay = new Chess()
  const key = (position) => position.fen().split(' ').slice(0, 4).join(' ')
  const target = key(game)
  let count = key(replay) === target ? 1 : 0
  for (const move of game.history()) {
    replay.move(move)
    if (key(replay) === target) count++
  }
  return count
}

export function chessResult(game) {
  if (game.isCheckmate()) return `${game.turn() === 'w' ? 'Neha' : 'Rajesh'} wins by checkmate`
  if (game.isStalemate()) return 'Draw by stalemate'
  if (game.isInsufficientMaterial()) return 'Draw by insufficient material'
  if (repetitionCount(game) >= 5) return 'Draw by fivefold repetition'
  if (Number(game.fen().split(' ')[4]) >= 150) return 'Draw by the 75-move rule'
  return null
}