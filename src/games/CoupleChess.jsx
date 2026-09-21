import { useState } from 'react'
import { RotateCcw, RefreshCw, Flag, Handshake } from 'lucide-react'
import { useSound } from '../hooks/useSound'
import { useLocalMatch } from '../hooks/useLocalMatch'
import Modal from '../components/Modal'
import { chessResult, restoreChess } from './chessRules'

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
  if (chessResult(game)) return chessResult(game)
  return `${currentName} to move${game.inCheck() ? ' — check!' : ''}`
}

export default function CoupleChess() {
  const play = useSound()
  const [match, setMatch] = useLocalMatch('chess', { moves: [], result: null })
  const [selected, setSelected] = useState(null)
  const [promotion, setPromotion] = useState(null)
  const [dialog, setDialog] = useState(null)
  const [flipped, setFlipped] = useState(false)
  const game = restoreChess(match.moves)
  const previous = game.history({ verbose: true }).at(-1)
  const lastMove = previous ? [previous.from, previous.to] : null
  const legalTargets = selected ? game.moves({ square: selected, verbose: true }).map((move) => move.to) : []
  const finished = !!match.result || !!chessResult(game)

  const commitMove = (move) => {
    game.move(move)
    setMatch({ moves: game.history(), result: chessResult(game) })
    setPromotion(null)
    setSelected(null)
    play(game.isCheckmate() ? 'win' : 'click')
  }

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
      const choices = game.moves({ square: selected, verbose: true }).filter((move) => move.to === square)
      if (choices.some((move) => move.promotion)) setPromotion({ from: selected, to: square })
      else commitMove({ from: selected, to: square })
    } catch {
      play('error')
      setSelected(null)
    }
  }

  const restart = () => {
    setMatch({ moves: [], result: null })
    setSelected(null)
    setDialog(null)
    setPromotion(null)
    play('click')
  }

  return (
    <div className="text-center">
      <div className="flex flex-wrap items-center justify-between gap-3 text-left">
        <div>
          <p className="editorial-label">Couple match</p>
          <p className="mt-1 font-display text-2xl text-ink" role="status">{match.result || statusFor(game)}</p>
        </div>
        <button onClick={() => setDialog('restart')} className="icon-button" aria-label="Restart chess match" title="Restart match">
          <RotateCcw size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="mx-auto mt-6 aspect-square w-full max-w-2xl overflow-hidden rounded-lg border-4 border-[#6f4b43] bg-[#6f4b43] shadow-soft">
        <div className="grid h-full grid-cols-8 grid-rows-8">
          {Array.from({ length: 64 }, (_, index) => {
            const rank = flipped ? 1 + Math.floor(index / 8) : 8 - Math.floor(index / 8)
            const fileIndex = flipped ? 7 - index % 8 : index % 8
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
                className={`relative grid min-w-0 place-items-center text-3xl sm:text-5xl leading-none transition ${
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
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button className="icon-button" title="Flip board" aria-label="Flip board" onClick={() => setFlipped(!flipped)}><RefreshCw size={18} /></button>
        <button className="btn-ghost" disabled={finished} onClick={() => setDialog('resign')}><Flag size={17} />Resign</button>
        <button className="btn-ghost" disabled={finished || match.moves.length < 2} onClick={() => setDialog('draw')}><Handshake size={17} />Offer draw</button>
        {!finished && (game.isThreefoldRepetition() || game.isDrawByFiftyMoves()) && <button className="btn" onClick={() => setMatch({ ...match, result: 'Draw claimed' })}>Claim draw</button>}
      </div>
      <details className="mt-5 text-left"><summary>Move history</summary><ol className="mt-2 grid grid-cols-2 gap-1 text-sm">{match.moves.map((move, index) => <li key={index}>{Math.floor(index / 2) + 1}{index % 2 ? '...' : '.'} {move}</li>)}</ol></details>
      <Modal open={!!promotion} onClose={() => setPromotion(null)}><h2 className="font-display text-2xl">Promote pawn</h2><div className="mt-5 flex gap-3">{[['q', 'Queen'], ['r', 'Rook'], ['b', 'Bishop'], ['n', 'Knight']].map(([piece, name]) => <button key={piece} className="btn-ghost text-3xl" aria-label={`Promote to ${name}`} title={name} onClick={() => commitMove({ ...promotion, promotion: piece })}>{PIECES[`${game.turn()}${piece}`]}</button>)}</div></Modal>
      <Modal open={!!dialog} onClose={() => setDialog(null)}><h2 className="font-display text-2xl">{dialog === 'restart' ? 'Start a new match?' : dialog === 'resign' ? 'Resign this match?' : 'Does your opponent accept the draw?'}</h2><div className="mt-5 flex gap-3"><button className="btn-ghost" onClick={() => setDialog(null)}>Cancel</button><button className="btn" onClick={() => {
        if (dialog === 'restart') restart()
        else { setMatch({ ...match, result: dialog === 'draw' ? 'Draw by agreement' : `${game.turn() === 'w' ? 'Neha' : 'Rajesh'} wins by resignation` }); setDialog(null) }
      }}>Confirm</button></div></Modal>
    </div>
  )
}