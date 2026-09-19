import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { tap } from '../lib/motion'
import { useSound } from '../hooks/useSound'
import CoupleGameSetup from './CoupleGameSetup'

const JUMPS = {
  4: 25,
  13: 46,
  33: 49,
  42: 63,
  50: 69,
  62: 81,
  74: 92,
  27: 5,
  40: 3,
  54: 31,
  66: 45,
  76: 58,
  89: 53,
  99: 41,
}

const BOARD = Array.from({ length: 10 }, (_, row) => {
  const rowStart = 100 - row * 10
  const cells = Array.from({ length: 10 }, (_, column) => rowStart - column)
  return row % 2 === 0 ? cells : cells.reverse()
}).flat()

export default function SnakesAndLadders() {
  const play = useSound()
  const [players, setPlayers] = useState(null)
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [die, setDie] = useState(null)
  const [rolling, setRolling] = useState(false)
  const [message, setMessage] = useState('')
  const [winner, setWinner] = useState(null)

  const startMatch = (seats) => {
    setPlayers(seats.map((player) => ({ ...player, position: 1 })))
    setCurrentPlayer(0)
    setDie(null)
    setRolling(false)
    setMessage('Rajesh goes first.')
    setWinner(null)
  }

  const takeTurn = () => {
    if (!players || rolling || winner) return
    setRolling(true)
    const rolled = Math.floor(Math.random() * 6) + 1
    setDie(rolled)

    window.setTimeout(() => {
      const active = players[currentPlayer]
      const attempted = active.position + rolled
      const landed = attempted > 100 ? active.position : attempted
      const destination = JUMPS[landed] || landed
      const jumped = destination !== landed
      const won = destination === 100

      setPlayers((current) =>
        current.map((player, index) =>
          index === currentPlayer ? { ...player, position: destination } : player,
        ),
      )
      setMessage(
        attempted > 100
          ? `${active.name} needs an exact roll to reach 100.`
          : jumped
            ? `${active.name} found ${destination > landed ? 'a ladder' : 'a snake'}: ${landed} to ${destination}.`
            : `${active.name} moved to ${destination}.`,
      )

      if (won) {
        setWinner(active)
        play('win')
      } else {
        setCurrentPlayer((currentPlayer + 1) % players.length)
        play(jumped ? (destination > landed ? 'win' : 'error') : 'flip')
      }
      setRolling(false)
    }, 450)
  }

  useEffect(() => {
    if (!players?.[currentPlayer]?.isBot || rolling || winner) return
    const timer = window.setTimeout(takeTurn, 750)
    return () => window.clearTimeout(timer)
  }, [currentPlayer, players, rolling, winner])

  if (!players) {
    return (
      <CoupleGameSetup
        description="Race from 1 to 100 together. Add either bot for a busier board."
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
          <p className="mt-1 font-display text-2xl text-ink" style={{ color: active.color }}>
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

      <div className="mx-auto mt-6 grid aspect-square w-full max-w-2xl grid-cols-10 overflow-hidden rounded-lg border border-[#d8ced2] bg-white shadow-soft">
        {BOARD.map((cell) => {
          const occupants = players.filter((player) => player.position === cell)
          const destination = JUMPS[cell]
          return (
            <div
              key={cell}
              className={`relative grid min-w-0 place-items-center border-b border-r border-[#ebe5e7] text-[9px] font-bold sm:text-xs ${
                destination ? (destination > cell ? 'bg-[#e4eee8]' : 'bg-[#f4dfe4]') : 'bg-white/80'
              }`}
            >
              <span className="absolute left-1 top-0.5 text-muted">{cell}</span>
              {destination && (
                <span className="text-sm sm:text-lg" aria-label={destination > cell ? `Ladder to ${destination}` : `Snake to ${destination}`}>
                  {destination > cell ? '🪜' : '🐍'}
                </span>
              )}
              <span className="absolute bottom-1 right-1 flex flex-wrap justify-end gap-0.5">
                {occupants.map((player) => (
                  <span
                    key={player.id}
                    className="h-2.5 w-2.5 rounded-full border border-white shadow-sm sm:h-3.5 sm:w-3.5"
                    style={{ backgroundColor: player.color }}
                    title={player.name}
                  />
                ))}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {players.map((player) => (
          <span key={player.id} className="inline-flex items-center gap-2 text-xs font-bold text-muted">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: player.color }} />
            {player.name}: {player.position}
          </span>
        ))}
      </div>
      <p className="mt-4 min-h-5 text-sm text-muted">{message}</p>

      {!winner && (
        <motion.button
          whileTap={tap}
          onClick={takeTurn}
          disabled={active.isBot || rolling}
          className="btn mt-4 min-w-36"
        >
          {rolling ? 'Rolling…' : active.isBot ? 'Bot is rolling…' : 'Roll die'}
        </motion.button>
      )}
    </div>
  )
}