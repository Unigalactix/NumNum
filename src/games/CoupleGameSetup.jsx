import { Bot, Heart, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { tap } from '../lib/motion'

const PLAYER_COLORS = ['#8f4058', '#71867a', '#c28c45', '#637fa3']

export default function CoupleGameSetup({ description, onStart, minPlayers = 2, defaultBots = 0 }) {
  const [seats, setSeats] = useState(Array.from({ length: 2 }, (_, index) => index < defaultBots ? 'bot' : 'empty'))

  const start = () => {
    const players = [
      { id: 'rajesh', name: 'Rajesh', color: PLAYER_COLORS[0], isBot: false },
      { id: 'neha', name: 'Neha', color: PLAYER_COLORS[1], isBot: false },
      ...seats.flatMap((type, index) =>
        type !== 'empty'
          ? [{ id: `guest-${index + 1}`, name: `${type === 'bot' ? 'Bot' : 'Guest'} ${index + 1}`, color: PLAYER_COLORS[index + 2], isBot: type === 'bot' }]
          : [],
      ),
    ]
    onStart(players)
  }

  return (
    <div className="mx-auto max-w-xl text-center">
      {description && <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted">{description}</p>}

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {['Rajesh', 'Neha'].map((name, index) => (
          <div key={name} className="flex items-center gap-3 rounded-lg border border-[#e4dde0] bg-white/75 p-4 text-left">
            <span className="grid h-10 w-10 place-items-center rounded-lg text-white" style={{ backgroundColor: PLAYER_COLORS[index] }}>
              <Heart size={18} fill="currentColor" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-bold text-ink">{name}</span>
              <span className="text-xs text-muted">playing together</span>
            </span>
          </div>
        ))}
      </div>

      <fieldset className="mt-6 border-t border-[#e4dde0] pt-5 text-left">
        <legend className="editorial-label px-2">Optional players</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {seats.map((type, index) => (
            <label key={index} className="flex cursor-pointer items-center justify-between rounded-lg border border-[#e4dde0] bg-white/75 p-4">
              <span className="flex items-center gap-3">
                <Bot size={19} style={{ color: PLAYER_COLORS[index + 2] }} aria-hidden="true" />
                <span className="text-sm font-bold text-ink">Seat {index + 3}</span>
              </span>
              <select className="min-h-11 rounded border bg-white px-2 text-sm" aria-label={`Seat ${index + 3}`} value={type} onChange={event => setSeats(current => current.map((seat, position) => position === index ? event.target.value : seat))}>
                <option value="empty">Empty</option><option value="bot">Bot</option><option value="human">Human</option>
              </select>
            </label>
          ))}
        </div>
      </fieldset>

      {2 + seats.filter(seat => seat !== 'empty').length < minPlayers && <p role="status" className="mt-4 text-sm text-wine">{minPlayers} players minimum</p>}
      <motion.button whileTap={tap} onClick={start} disabled={2 + seats.filter(seat => seat !== 'empty').length < minPlayers} className="btn mt-7">
        <Play size={17} fill="currentColor" aria-hidden="true" />
        Start match
      </motion.button>
    </div>
  )
}