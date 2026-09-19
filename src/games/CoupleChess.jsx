import { useState } from 'react'
import { Chess } from 'chess.js'
import { RotateCcw } from 'lucide-react'
import { useSound } from '../hooks/useSound'

const PIECES = {
  wp: '♙',
  wn: '♘',
  wb: '♗',
  wr: '♖',
  wq: '♕',
  wk: '♔',
  bp: '♟',
  bn: '♞',
  bb: '♝',
  br: '♜',
  bq: '♛',
  bk: '♚',
}
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

function statusFor(game) {
  const currentName = game.turn() === 'w' ? 'Rajesh' : 'Neha'
  if (game.isCheckmate()) return `${currentName} is checkmated. ${game.turn() === 'w' ? 'Neha' : 'Rajesh'} wins!`
  if (game.isStalemate()) return 'Stalemate. This match is a draw.'
  if (game.isThreefoldRepetition()) return 'Threefold repetition. This match is a draw.'
  if (game.isInsufficientMaterial()) return 'Insufficient material. This match is a draw.'
  if (game.isDraw()) return 'This match is a draw.'
  return `${currentName} to move${game.inCheck() ? ' — check!' : ''}`
}

export default function CoupleChess() {
  const play = useSound()
  const [fen, setFen] = useState(() => new Chess().fen())
  const [selected, setSelected] = useState(null)
  const [lastMove, setLastMove] = useState(null)
  const game = new Chess(fen)
  const legalTargets = selected ? game.moves({ square: selected, verbose: true }).map((move) => move.to) : []
  const finished = game.isGameOver()

  const selectSquare = (square) => {
    if (finished) return
    const piece = game.get(square)

    if (!selected) {
      if (piece?.color === game.turn()) {
        setSelected(square)
        play('click')
      }
      return
    }

    if (piece?.color === game.turn()) {
      setSelected(square)
      play('click')
      return
    }

    try {
      const move = game.move({ from: selected, to: square, promotion: 'q' })
      setFen(game.fen())
      setLastMove([move.from, move.to])
      setSelected(null)
      play(game.isCheckmate() ? 'win' : game.inCheck() ? 'flip' : 'click')
    } catch {
      play('error')
      setSelected(null)
    }
  }

  const restart = () => {
    const fresh = new Chess()
    setFen(fresh.fen())
    setSelected(null)
    setLastMove(null)
    play('click')
  }

  return (
    <div className="text-center">
      <div className="flex flex-wrap items-center justify-between gap-3 text-left">
        <div>
          <p className="editorial-label">Couple match</p>
          <p className="mt-1 font-display text-2xl text-ink">{statusFor(game)}</p>
        </div>
        <button onClick={restart} className="icon-button" aria-label="Restart chess match" title="Restart match">
          <RotateCcw size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="mx-auto mt-6 aspect-square w-full max-w-2xl overflow-hidden rounded-lg border-4 border-[#6f4b43] bg-[#6f4b43] shadow-soft">
        <div className="grid h-full grid-cols-8 grid-rows-8">
          {Array.from({ length: 64 }, (_, index) => {
            const rank = 8 - Math.floor(index / 8)
            const fileIndex = index % 8
            const square = `${FILES[fileIndex]}${rank}`
            const piece = game.get(square)
            const dark = (rank + fileIndex) % 2 === 1
            const isSelected = selected === square
            const isTarget = legalTargets.includes(square)
            const wasMoved = lastMove?.includes(square)
            return (
              <button
                key={square}
                onClick={() => selectSquare(square)}
                className={`relative grid min-w-0 place-items-center text-[clamp(1.5rem,8vw,3.7rem)] leading-none transition ${
                  dark ? 'bg-[#9a6d63]' : 'bg-[#f1e6db]'
                } ${wasMoved ? 'after:absolute after:inset-0 after:bg-[#d7b467]/35' : ''} ${isSelected ? 'ring-inset ring-4 ring-wine' : ''}`}
                aria-label={`${square}${piece ? `, ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ', empty'}`}
                aria-pressed={isSelected}
              >
                {isTarget && <span className="absolute h-1/4 w-1/4 rounded-full bg-wine/55" aria-hidden="true" />}
                {piece && <span className="relative z-10 drop-shadow-sm">{PIECES[`${piece.color}${piece.type}`]}</span>}
                {fileIndex === 0 && <span className="absolute left-0.5 top-0.5 text-[8px] font-bold text-ink/45 sm:text-[10px]">{rank}</span>}
                {rank === 1 && <span className="absolute bottom-0 right-0.5 text-[8px] font-bold text-ink/45 sm:text-[10px]">{FILES[fileIndex]}</span>}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5 flex justify-center gap-6 text-sm font-bold">
        <span className="text-wine">♔ Rajesh</span>
        <span className="text-sage">♚ Neha</span>
      </div>
      <p className="mt-3 text-xs text-muted">Select a piece, then choose one of its marked legal squares.</p>
    </div>
  )
}