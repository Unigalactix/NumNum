import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { tap } from '../lib/motion'
import { useSound } from '../hooks/useSound'
import CoupleGameSetup from './CoupleGameSetup'

const TRACK_LENGTH = 52
const FINISH = 58
const START_OFFSETS = [0, 13, 26, 39]
const SAFE_CELLS = new Set([0, 8, 13, 21, 26, 34, 39, 47])

const TRACK_COORDINATES = (() => {
  const coordinates = []
  for (let column = 0; column < 14; column++) coordinates.push([0, column])
  for (let row = 1; row < 13; row++) coordinates.push([row, 13])
  for (let column = 13; column >= 0; column--) coordinates.push([13, column])
  for (let row = 12; row >= 1; row--) coordinates.push([row, 0])
  return coordinates
})()

const coordinateToTrack = new Map(TRACK_COORDINATES.map(([row, column], index) => [`${row}-${column}`, index]))

function globalCell(playerIndex, progress) {
  return progress >= 0 && progress < TRACK_LENGTH
    ? (START_OFFSETS[playerIndex] + progress) % TRACK_LENGTH
    : null
}

function legalPieces(pieces, die) {
  return pieces.flatMap((progress, index) => {
    if (progress === FINISH) return []
    if (progress === -1) return die === 6 ? [index] : []
    return progress + die <= FINISH ? [index] : []
  })
}

export default function Ludo() {
  const play = useSound()
  const [players, setPlayers] = useState(null)
  const [pieces, setPieces] = useState([])
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [die, setDie] = useState(null)
  const [winner, setWinner] = useState(null)
  const [message, setMessage] = useState('')

  const startMatch = (seats) => {
    setPlayers(seats)
    setPieces(seats.map(() => [-1, -1, -1, -1]))
    setCurrentPlayer(0)
    setDie(null)
    setWinner(null)
    setMessage('Rajesh goes first. Roll a six to leave home.')
  }

  const nextTurn = () => {
    setDie(null)
    setCurrentPlayer((current) => (current + 1) % players.length)
  }

  const roll = () => {
    if (die || winner) return
    const rolled = Math.floor(Math.random() * 6) + 1
    setDie(rolled)
    setMessage(`${players[currentPlayer].name} rolled ${rolled}.`)
    play('flip')
  }

  const movePiece = (pieceIndex) => {
    if (!die || winner) return
    const valid = legalPieces(pieces[currentPlayer], die)
    if (!valid.includes(pieceIndex)) return

    const oldProgress = pieces[currentPlayer][pieceIndex]
    const progress = oldProgress === -1 ? 0 : oldProgress + die
    const landingCell = globalCell(currentPlayer, progress)
    let captureCount = 0
    const nextPieces = pieces.map((playerPieces) => [...playerPieces])
    nextPieces[currentPlayer][pieceIndex] = progress

    if (landingCell !== null && !SAFE_CELLS.has(landingCell)) {
      nextPieces.forEach((playerPieces, playerIndex) => {
        if (playerIndex === currentPlayer) return
        playerPieces.forEach((opponentProgress, opponentPiece) => {
          if (globalCell(playerIndex, opponentProgress) === landingCell) {
            nextPieces[playerIndex][opponentPiece] = -1
            captureCount += 1
          }
        })
      })
    }

    const active = players[currentPlayer]
    const won = nextPieces[currentPlayer].every((value) => value === FINISH)
    setPieces(nextPieces)
    setMessage(
      won
        ? `${active.name} brought every piece home!`
        : captureCount
          ? `${active.name} sent ${captureCount} piece${captureCount > 1 ? 's' : ''} home.`
          : progress === FINISH
            ? `${active.name} finished a piece.`
            : `${active.name} moved piece ${pieceIndex + 1}.`,
    )

    if (won) {
      setWinner(active)
      play('win')
      setDie(null)
    } else if (die === 6) {
      setDie(null)
      setMessage(`${active.name} rolled a six and goes again.`)
      play('win')
    } else {
      nextTurn()
      play(captureCount ? 'win' : 'click')
    }
  }

  const valid = players && die ? legalPieces(pieces[currentPlayer], die) : []

  useEffect(() => {
    if (!players || winner) return
    const active = players[currentPlayer]
    if (active.isBot && !die) {
      const timer = window.setTimeout(roll, 650)
      return () => window.clearTimeout(timer)
    }
    if (die && valid.length === 0) {
      const timer = window.setTimeout(() => {
        setMessage(`${active.name} has no legal move.`)
        nextTurn()
      }, 750)
      return () => window.clearTimeout(timer)
    }
    if (active.isBot && die && valid.length > 0) {
      const finishMove = valid.find((index) => pieces[currentPlayer][index] + die === FINISH)
      const timer = window.setTimeout(() => movePiece(finishMove ?? valid[0]), 650)
      return () => window.clearTimeout(timer)
    }
  }, [currentPlayer, die, players, winner])

  if (!players) {
    return (
      <CoupleGameSetup
        description="Bring all four pieces home. Add bots to fill the yellow and blue seats."
        onStart={startMatch}
      />
    )
  }

  const active = players[currentPlayer]

  return (
    <div className="text-center">
      <div className="flex flex-wrap items-center justify-between gap-3 text-left">
        <div>
          <p className="editorial-label">Current turn</p>
          <p className="mt-1 font-display text-2xl" style={{ color: winner?.color || active.color }}>
            {winner ? `${winner.name} wins!` : active.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-lg border border-[#e4dde0] bg-white font-display text-2xl text-wine shadow-soft">
            {die || '–'}
          </span>
          <button onClick={() => setPlayers(null)} className="icon-button" aria-label="New match" title="New match">
            <RotateCcw size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="relative mx-auto mt-6 aspect-square w-full max-w-2xl overflow-hidden rounded-lg border border-[#d8ced2] bg-[#f4f0ed] p-1 shadow-soft">
        <div className="grid h-full grid-cols-[repeat(14,minmax(0,1fr))] grid-rows-[repeat(14,minmax(0,1fr))] gap-px">
          {Array.from({ length: 196 }, (_, flatIndex) => {
            const row = Math.floor(flatIndex / 14)
            const column = flatIndex % 14
            const trackIndex = coordinateToTrack.get(`${row}-${column}`)
            const occupants = trackIndex === undefined
              ? []
              : players.flatMap((player, playerIndex) =>
                  pieces[playerIndex].flatMap((progress, pieceIndex) =>
                    globalCell(playerIndex, progress) === trackIndex
                      ? [{ ...player, pieceIndex }]
                      : [],
                  ),
                )
            const isSafe = SAFE_CELLS.has(trackIndex)
            return (
              <div
                key={flatIndex}
                className={`relative grid place-items-center ${
                  trackIndex === undefined
                    ? 'bg-transparent'
                    : isSafe
                      ? 'border border-white bg-[#e1e9e3]'
                      : 'border border-white bg-white/90'
                }`}
              >
                {isSafe && <span className="text-[8px] text-sage sm:text-xs">◆</span>}
                {occupants.length > 0 && (
                  <span className="absolute inset-0 flex flex-wrap items-center justify-center gap-0.5 p-0.5">
                    {occupants.map((piece) => (
                      <span
                        key={`${piece.id}-${piece.pieceIndex}`}
                        className="h-2 w-2 rounded-full border border-white shadow-sm sm:h-3 sm:w-3"
                        style={{ backgroundColor: piece.color }}
                        title={`${piece.name}, piece ${piece.pieceIndex + 1}`}
                      />
                    ))}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        <div className="absolute inset-[22%] grid place-items-center rounded-lg border border-[#e4dde0] bg-white/95 p-3 shadow-soft">
          <div className="grid w-full grid-cols-2 gap-2">
            {players.map((player, playerIndex) => (
              <div key={player.id} className="rounded-md border border-[#ebe5e7] bg-white p-2 text-left">
                <p className="truncate text-[10px] font-bold sm:text-xs" style={{ color: player.color }}>{player.name}</p>
                <p className="mt-1 text-[9px] text-muted sm:text-[11px]">
                  home {pieces[playerIndex].filter((value) => value === FINISH).length}/4
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 min-h-5 text-sm text-muted">{message}</p>

      {!winner && !die && (
        <motion.button whileTap={tap} onClick={roll} disabled={active.isBot} className="btn mt-4 min-w-36">
          {active.isBot ? 'Bot is rolling…' : 'Roll die'}
        </motion.button>
      )}

      {!winner && die && valid.length > 0 && !active.isBot && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {pieces[currentPlayer].map((progress, pieceIndex) => (
            <motion.button
              key={pieceIndex}
              whileTap={tap}
              onClick={() => movePiece(pieceIndex)}
              disabled={!valid.includes(pieceIndex)}
              className="btn-ghost min-w-24 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Piece {pieceIndex + 1}
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: active.color }} />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}