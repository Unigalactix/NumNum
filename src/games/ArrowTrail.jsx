import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useSound } from '../hooks/useSound'
import { tap } from '../lib/motion'

const SIZE = 4
const START = 0
const FINISH = 12

// A snake-shaped route from the top-left tile to the heart.
const SOLUTION = [
  0, 0, 0, 90,
  90, 180, 180, 180,
  0, 0, 0, 90,
  null, 180, 180, 180,
]

const OFFSETS = [1, 2, 0, 3, 2, 1, 3, 0, 1, 3, 2, 1, 0, 2, 1, 3]

function makeTiles() {
  return SOLUTION.map((direction, index) =>
    direction === null ? null : (direction + OFFSETS[index] * 90) % 360,
  )
}

function nextTile(index, direction) {
  const row = Math.floor(index / SIZE)
  const column = index % SIZE
  if (direction === 0 && column < SIZE - 1) return index + 1
  if (direction === 90 && row < SIZE - 1) return index + SIZE
  if (direction === 180 && column > 0) return index - 1
  if (direction === 270 && row > 0) return index - SIZE
  return null
}

function traceRoute(tiles) {
  const route = []
  const seen = new Set()
  let current = START

  while (current !== null && !seen.has(current)) {
    route.push(current)
    seen.add(current)
    if (current === FINISH) break
    current = nextTile(current, tiles[current])
  }

  return route
}

export default function ArrowTrail({ onComplete }) {
  const play = useSound()
  const [tiles, setTiles] = useState(makeTiles)
  const route = useMemo(() => traceRoute(tiles), [tiles])
  const routeSet = useMemo(() => new Set(route), [route])
  const solved = route.length === SIZE * SIZE && route.at(-1) === FINISH

  const rotate = (index) => {
    if (tiles[index] === null || solved) return
    play('flip')
    setTiles((current) =>
      current.map((direction, tileIndex) =>
        tileIndex === index ? (direction + 90) % 360 : direction,
      ),
    )
  }

  useEffect(() => {
    if (!solved) return
    play('win')
    const timer = setTimeout(() => onComplete(), 800)
    return () => clearTimeout(timer)
  }, [onComplete, play, solved])

  return (
    <div className="text-center">
      <h2 className="gradient-text font-script text-3xl">Arrow Trail</h2>
      <p className="mt-1 text-[#7a5570]">
        Rotate the arrows into one unbroken path from start to heart.
      </p>
      <p className="mt-1 text-sm font-semibold text-rose/70">
        {solved ? 'every turn leads to you 💗' : `${route.length} / ${SIZE * SIZE} connected`}
      </p>

      <div className="mx-auto mt-6 grid w-full max-w-sm grid-cols-4 gap-2 rounded-3xl bg-white/45 p-3">
        {tiles.map((direction, index) => {
          const connected = routeSet.has(index)
          const isStart = index === START
          const isFinish = index === FINISH

          return (
            <motion.button
              key={index}
              whileTap={isFinish || solved ? undefined : tap}
              onClick={() => rotate(index)}
              aria-label={
                isFinish
                  ? 'Heart, end of the path'
                  : `${isStart ? 'Start tile, ' : ''}rotate arrow clockwise`
              }
              className={`relative grid aspect-square place-items-center rounded-2xl text-3xl transition sm:text-4xl ${
                connected
                  ? 'bg-gradient-to-br from-petal/85 to-periwinkle/75 shadow-soft'
                  : 'bg-white/90 hover:bg-white'
              } ${isStart ? 'ring-2 ring-rose' : ''}`}
            >
              {isFinish ? (
                <span>💗</span>
              ) : (
                <motion.span
                  animate={{ rotate: direction }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  className="inline-block font-bold leading-none text-[#6b4560]"
                >
                  ➜
                </motion.span>
              )}
              {isStart && (
                <span className="absolute left-1.5 top-1 text-[10px] font-bold uppercase text-rose">
                  start
                </span>
              )}
            </motion.button>
          )
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <motion.button
          whileTap={tap}
          onClick={() => {
            play('click')
            setTiles(makeTiles())
          }}
          className="btn-ghost"
        >
          ↺ shuffle back
        </motion.button>
        <span className="rounded-full bg-white/70 px-4 py-1.5 text-xs font-semibold text-rose">
          tap an arrow to turn it
        </span>
      </div>
    </div>
  )
}