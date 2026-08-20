import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSound } from '../hooks/useSound'
import { tap } from '../lib/motion'

const GOAL = 10
const ROUND_SECONDS = 25

function makeDuck() {
  return {
    id: `${Date.now()}-${Math.random()}`,
    x: 8 + Math.random() * 76,
    y: 12 + Math.random() * 62,
    facing: Math.random() > 0.5 ? 1 : -1,
  }
}

export default function DuckHunt({ onComplete }) {
  const play = useSound()
  const [status, setStatus] = useState('ready')
  const [duck, setDuck] = useState(null)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [seconds, setSeconds] = useState(ROUND_SECONDS)
  const solved = hits >= GOAL

  const start = () => {
    play('click')
    setHits(0)
    setMisses(0)
    setSeconds(ROUND_SECONDS)
    setDuck(makeDuck())
    setStatus('playing')
  }

  const catchDuck = (event) => {
    event.stopPropagation()
    if (status !== 'playing') return
    play('flip')
    setHits((current) => current + 1)
    setDuck(makeDuck())
  }

  useEffect(() => {
    if (status !== 'playing') return
    const clock = setInterval(() => setSeconds((current) => current - 1), 1000)
    return () => clearInterval(clock)
  }, [status])

  useEffect(() => {
    if (status !== 'playing' || !duck) return
    const flight = setTimeout(() => {
      setMisses((current) => current + 1)
      setDuck(makeDuck())
    }, 1150)
    return () => clearTimeout(flight)
  }, [duck, status])

  useEffect(() => {
    if (status !== 'playing' || solved) return
    if (seconds <= 0) {
      play('error')
      setDuck(null)
      setStatus('lost')
    }
  }, [misses, play, seconds, solved, status])

  useEffect(() => {
    if (!solved) return
    setStatus('won')
    setDuck(null)
    play('win')
    const timer = setTimeout(() => onComplete(), 900)
    return () => clearTimeout(timer)
  }, [onComplete, play, solved])

  return (
    <div className="text-center">
      <h2 className="gradient-text font-script text-3xl">Mini Duck Hunt</h2>
      <p className="mt-1 text-[#7a5570]">Spot and tap {GOAL} ducks before they fly away.</p>

      <div className="mx-auto mt-4 flex max-w-xl items-center justify-between rounded-full bg-white/65 px-5 py-2 text-sm font-bold text-rose">
        <span>ducks {hits} / {GOAL}</span>
        <span>{seconds}s</span>
        <span>missed {misses}</span>
      </div>

      <div
        className="relative mx-auto mt-4 aspect-[4/3] w-full max-w-xl overflow-hidden rounded-3xl border-2 border-white/70 bg-gradient-to-b from-sky-200 via-sky-100 to-mint/80 shadow-inner"
        aria-label="Duck Hunt play field"
      >
        <div className="absolute bottom-0 left-0 right-0 h-[24%] bg-mint/90" />
        <div className="absolute bottom-[18%] left-[8%] text-5xl opacity-80">🌷</div>
        <div className="absolute bottom-[18%] right-[8%] text-5xl opacity-80">🌼</div>

        {duck && status === 'playing' && (
          <motion.button
            key={duck.id}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileTap={tap}
            onClick={catchDuck}
            className="absolute grid h-16 w-16 place-items-center rounded-full bg-white/45 text-5xl shadow-soft backdrop-blur-sm sm:h-20 sm:w-20 sm:text-6xl"
            style={{ left: `${duck.x}%`, top: `${duck.y}%`, transform: 'translate(-50%, -50%)' }}
            aria-label="Tap the duck"
          >
            <span
              style={{ scaleX: duck.facing }}
              className="inline-block"
            >
              🦆
            </span>
          </motion.button>
        )}

        {status !== 'playing' && (
          <div className="absolute inset-0 grid place-items-center bg-white/55 p-6 backdrop-blur-sm">
            <div>
              <div className="text-6xl">🦆</div>
              <p className="mt-3 font-script text-3xl text-rose">
                {status === 'lost' ? 'They flew away!' : 'Ready to spot them?'}
              </p>
              {status !== 'won' && (
                <motion.button whileTap={tap} onClick={start} className="btn mt-4">
                  {status === 'lost' ? '↺ try again' : 'start the hunt'}
                </motion.button>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs font-semibold text-rose/60">
        quick eyes, gentle taps — no ducks are harmed 💗
      </p>
    </div>
  )
}