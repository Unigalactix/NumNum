import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { content } from '../content'
import { useSound } from '../hooks/useSound'

const SIZE = 3 // 3x3 sliding puzzle
const TOTAL = SIZE * SIZE

// Soft gradient tiles as a fallback when no photo is provided
const TILE_GRADIENTS = [
  'from-petal to-rose',
  'from-lavender to-periwinkle',
  'from-peach to-rose',
  'from-mint to-sky',
  'from-sky to-periwinkle',
  'from-blush to-petal',
  'from-periwinkle to-lavender',
  'from-rose to-peach',
]

function isSolved(tiles) {
  for (let i = 0; i < TOTAL - 1; i++) if (tiles[i] !== i) return false
  return true
}

function shuffled() {
  // simple solvable shuffle: start solved, make many random valid moves
  let tiles = [...Array(TOTAL).keys()] // last index = blank
  let blank = TOTAL - 1
  for (let n = 0; n < 200; n++) {
    const moves = neighbors(blank)
    const pick = moves[Math.floor(Math.random() * moves.length)]
    ;[tiles[blank], tiles[pick]] = [tiles[pick], tiles[blank]]
    blank = pick
  }
  return tiles
}

function neighbors(i) {
  const r = Math.floor(i / SIZE)
  const c = i % SIZE
  const res = []
  if (r > 0) res.push(i - SIZE)
  if (r < SIZE - 1) res.push(i + SIZE)
  if (c > 0) res.push(i - 1)
  if (c < SIZE - 1) res.push(i + 1)
  return res
}

export default function Puzzle({ onComplete }) {
  const play = useSound()
  const configured = content.puzzleImage || content.photos?.[0]
  const [imgOk, setImgOk] = useState(false)
  const [loading, setLoading] = useState(!!configured)
  const [tiles, setTiles] = useState(shuffled)
  const [won, setWon] = useState(false)

  // keep latest onComplete without retriggering the win timer
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // only use the photo if it actually loads, otherwise use gradient tiles
  useEffect(() => {
    if (!configured) return
    const img = new Image()
    img.onload = () => {
      setImgOk(true)
      setLoading(false)
    }
    img.onerror = () => {
      setImgOk(false)
      setLoading(false)
    }
    img.src = `${import.meta.env.BASE_URL}${configured}`
  }, [configured])

  const photo = imgOk ? configured : null

  const blank = tiles.indexOf(TOTAL - 1)

  const move = (idx) => {
    if (won) return
    if (!neighbors(blank).includes(idx)) return
    play('flip')
    const next = [...tiles]
    ;[next[blank], next[idx]] = [next[idx], next[blank]]
    setTiles(next)
  }

  useEffect(() => {
    if (isSolved(tiles) && !won) setWon(true)
  }, [tiles, won])

  // fire completion once, 1.8s after the picture merges — resilient to re-renders
  useEffect(() => {
    if (!won) return
    play('win')
    const t = setTimeout(() => onCompleteRef.current(), 1800)
    return () => clearTimeout(t)
  }, [won, play])

  const bgStyle = useMemo(
    () => (photo ? { backgroundImage: `url(${import.meta.env.BASE_URL}${photo})` } : null),
    [photo],
  )

  return (
    <div className="text-center">
      <h2 className="gradient-text font-script text-3xl">Piece Us Together</h2>
      <p className="mt-1 text-[#7a5570]">
        Slide the tiles into order to complete the picture 🧩
      </p>

      <div
        className={`relative mx-auto mt-6 grid aspect-square w-full max-w-xs rounded-3xl bg-white/50 shadow-soft transition-all duration-500 ${
          won ? 'gap-0 p-0' : 'gap-1.5 p-2'
        }`}
        style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
      >
        {loading && (
          <div className="skeleton absolute inset-0 z-10 rounded-3xl" />
        )}
        {tiles.map((tile, idx) => {
          const isBlank = tile === TOTAL - 1
          if (isBlank && !won) return <div key={idx} />
          const tr = Math.floor(tile / SIZE)
          const tc = tile % SIZE
          const canMove = neighbors(blank).includes(idx)
          return (
            <motion.button
              key={idx}
              layout
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={() => move(idx)}
              disabled={won || !canMove}
              aria-label={`Tile ${tile + 1}, row ${Math.floor(idx / SIZE) + 1}, column ${
                (idx % SIZE) + 1
              }${canMove ? ', move into empty space' : ''}`}
              className={`grid place-items-center overflow-hidden text-xl font-bold text-white shadow ${
                won ? 'rounded-none shadow-none' : 'rounded-xl'
              } ${
                photo ? '' : `bg-gradient-to-br ${TILE_GRADIENTS[tile % TILE_GRADIENTS.length]}`
              }`}
              style={
                photo
                  ? {
                      ...bgStyle,
                      backgroundSize: `${SIZE * 100}%`,
                      backgroundPosition: `${(tc / (SIZE - 1)) * 100}% ${
                        (tr / (SIZE - 1)) * 100
                      }%`,
                    }
                  : undefined
              }
            >
              {!photo && !won && tile + 1}
            </motion.button>
          )
        })}

        {won && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.35 }}
            className="pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-mint px-4 py-1.5 text-sm font-bold text-white shadow-soft"
          >
            Done 💖
          </motion.div>
        )}
      </div>
    </div>
  )
}
