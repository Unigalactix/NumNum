import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { content } from '../content'
import { useSound } from '../hooks/useSound'

const PAIRS = 6

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function MemoryMatch({ onComplete }) {
  const play = useSound()

  // deck holds pair keys 0..5 (doubled + shuffled); the face is chosen at render
  const stickers = useMemo(() => shuffle(content.stickerCollection).slice(0, PAIRS), [])
  const emojis = content.memoryEmojis
  const deck = useMemo(() => {
    const keys = Array.from({ length: PAIRS }, (_, k) => k)
    return shuffle([...keys, ...keys]).map((key, i) => ({ id: i, key }))
  }, [])

  const [flipped, setFlipped] = useState([]) // indexes currently face-up (max 2)
  const [matched, setMatched] = useState([]) // matched card ids
  const [lock, setLock] = useState(false)
  const [moves, setMoves] = useState(0)

  const flip = (idx) => {
    if (lock || flipped.includes(idx) || matched.includes(deck[idx].id)) return
    play('flip')
    setFlipped((f) => [...f, idx])
  }

  useEffect(() => {
    if (flipped.length !== 2) return
    setLock(true)
    setMoves((m) => m + 1)
    const [a, b] = flipped
    if (deck[a].key === deck[b].key) {
      play('pop')
      setMatched((m) => [...m, deck[a].id, deck[b].id])
      setFlipped([])
      setLock(false)
    } else {
      const t = setTimeout(() => {
        setFlipped([])
        setLock(false)
      }, 850)
      return () => clearTimeout(t)
    }
  }, [flipped, deck, play])

  const done = matched.length === deck.length
  useEffect(() => {
    if (done) {
      play('win')
      const t = setTimeout(() => onComplete(), 700)
      return () => clearTimeout(t)
    }
  }, [done, onComplete, play])

  return (
    <div className="text-center">
      <h2 className="gradient-text font-script text-3xl">Memory of Us</h2>
      <p className="mt-1 text-[#7a5570]">Flip the cards and find every matching pair 💞</p>
      <p className="mt-1 text-sm font-semibold text-rose/70">Moves: {moves}</p>

      <div className="mx-auto mt-6 grid max-w-md grid-cols-4 gap-3">
        {deck.map((card, idx) => {
          const isUp = flipped.includes(idx) || matched.includes(card.id)
          const sticker = stickers[card.key]
          return (
            <button
              key={card.id}
              onClick={() => flip(idx)}
              disabled={lock || matched.includes(card.id)}
              aria-pressed={isUp}
              aria-label={
                matched.includes(card.id)
                  ? `Card ${idx + 1}, matching symbol ${card.key + 1}, matched`
                  : isUp
                    ? `Card ${idx + 1}, matching symbol ${card.key + 1}, revealed`
                    : `Card ${idx + 1}, face down`
              }
              className="relative aspect-square"
              style={{ perspective: 600 }}
            >
              <motion.div
                className="relative h-full w-full"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isUp ? 180 : 0 }}
                transition={{ duration: 0.4 }}
              >
                <div
                  className="absolute inset-0 grid place-items-center rounded-2xl bg-gradient-to-br from-petal to-periwinkle text-2xl text-white shadow-soft"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  💗
                </div>
                <div
                  className={`absolute inset-0 grid place-items-center overflow-hidden rounded-2xl bg-white text-3xl shadow-soft ${
                    matched.includes(card.id) ? 'ring-2 ring-mint' : ''
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {sticker ? (
                    <img
                      src={`${import.meta.env.BASE_URL}${sticker.file}`}
                      alt=""
                      className="h-full w-full p-1 object-contain"
                    />
                  ) : (
                    emojis[card.key]
                  )}
                </div>
              </motion.div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

