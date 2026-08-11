import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useSound } from '../hooks/useSound'
import { tap } from '../lib/motion'

// LinkedIn "Zip" style: draw one continuous path that visits every cell once,
// passing through the numbered checkpoints 1 → 6 in order.
const N = 5
const CELLS = N * N

// Checkpoints placed along a valid snake path so the puzzle is always solvable.
// cell index (r*N + c) -> checkpoint number
const NUMBERS = { 0: 1, 4: 2, 5: 3, 14: 4, 15: 5, 24: 6 }
const MAX_NUM = 6

const rc = (i) => [Math.floor(i / N), i % N]
const adjacent = (a, b) => {
  const [ra, ca] = rc(a)
  const [rb, cb] = rc(b)
  return Math.abs(ra - rb) + Math.abs(ca - cb) === 1
}
const center = (i) => {
  const [r, c] = rc(i)
  return { x: ((c + 0.5) / N) * 100, y: ((r + 0.5) / N) * 100 }
}

export default function Zip({ onComplete }) {
  const play = useSound()
  const [path, setPath] = useState([])

  const visited = useMemo(() => new Set(path), [path])
  const numbersHit = path.filter((i) => NUMBERS[i]).length
  const solved = path.length === CELLS

  const handle = (i) => {
    if (solved) return

    // start: must begin on checkpoint 1
    if (path.length === 0) {
      if (NUMBERS[i] === 1) {
        play('flip')
        setPath([i])
      } else {
        play('error')
      }
      return
    }

    // clicking a visited cell trims the path back to it
    const at = path.indexOf(i)
    if (at !== -1) {
      play('click')
      setPath((p) => p.slice(0, at + 1))
      return
    }

    // extend: must be adjacent to the head and keep checkpoints in order
    const head = path[path.length - 1]
    if (!adjacent(head, i)) {
      play('error')
      return
    }
    if (NUMBERS[i] && NUMBERS[i] !== numbersHit + 1) {
      play('error') // that checkpoint isn't next
      return
    }
    play('flip')
    setPath((p) => [...p, i])
  }

  useEffect(() => {
    if (!solved) return
    play('win')
    const t = setTimeout(() => onComplete(), 800)
    return () => clearTimeout(t)
  }, [solved, onComplete, play])

  const points = path.map(center).map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="text-center">
      <h2 className="gradient-text font-script text-3xl">Zip</h2>
      <p className="mt-1 text-[#7a5570]">
        Draw one path through every cell, hitting 1 → 6 in order 🧵
      </p>
      <p className="mt-1 text-sm font-semibold text-rose/70">
        {solved ? 'linked it all up 💗' : `${path.length} / ${CELLS} cells`}
      </p>

      <div className="relative mx-auto mt-6 w-full max-w-xs">
        <div className="grid grid-cols-5 gap-1.5 rounded-3xl bg-white/40 p-2">
          {Array.from({ length: CELLS }, (_, i) => {
            const isHead = path[path.length - 1] === i
            const num = NUMBERS[i]
            const startHint = path.length === 0 && num === 1
            return (
              <motion.button
                key={i}
                whileTap={solved ? undefined : tap}
                onClick={() => handle(i)}
                className={`relative grid aspect-square place-items-center rounded-xl transition ${
                  visited.has(i)
                    ? 'bg-gradient-to-br from-petal/80 to-periwinkle/80'
                    : 'bg-white/90 hover:bg-white'
                } ${isHead ? 'ring-2 ring-rose' : ''} ${
                  startHint ? 'ring-2 ring-periwinkle' : ''
                }`}
              />
            )
          })}
        </div>

        {/* the drawn line */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-2"
          style={{ width: 'calc(100% - 1rem)', height: 'calc(100% - 1rem)' }}
        >
          {points && (
            <polyline
              points={points}
              fill="none"
              stroke="rgba(255,143,177,0.85)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {/* checkpoint badges */}
        {Object.entries(NUMBERS).map(([idx, num]) => {
          const { x, y } = center(Number(idx))
          const inset = 'calc(0.5rem)'
          return (
            <div
              key={idx}
              className="pointer-events-none absolute grid h-7 w-7 place-items-center rounded-full bg-white text-sm font-bold text-rose shadow-soft"
              style={{
                left: `calc(${inset} + (100% - 1rem) * ${x / 100})`,
                top: `calc(${inset} + (100% - 1rem) * ${y / 100})`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {num}
            </div>
          )
        })}
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <motion.button
          whileTap={tap}
          onClick={() => {
            play('click')
            setPath([])
          }}
          className="btn-ghost"
        >
          ↺ clear
        </motion.button>
        <span className="rounded-full bg-white/70 px-4 py-1.5 text-xs font-semibold text-rose">
          tap the 1, then trace to 6
        </span>
      </div>
    </div>
  )
}
