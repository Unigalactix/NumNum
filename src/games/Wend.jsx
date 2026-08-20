import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { content } from '../content'
import { useSound } from '../hooks/useSound'
import { tap } from '../lib/motion'

// LinkedIn word-path style: trace letters in a straight line to spell the hidden words.
const SIZE = 9
const DIRS = [
  [0, 1], [1, 0], [1, 1], [1, -1],
  [0, -1], [-1, 0], [-1, -1], [-1, 1],
]
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const rand = (n) => Math.floor(Math.random() * n)

function generate(words) {
  for (let attempt = 0; attempt < 400; attempt++) {
    const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
    let ok = true
    for (const w of words) {
      let placed = false
      for (let t = 0; t < 150 && !placed; t++) {
        const [dr, dc] = DIRS[rand(DIRS.length)]
        const r = rand(SIZE)
        const c = rand(SIZE)
        const endR = r + dr * (w.length - 1)
        const endC = c + dc * (w.length - 1)
        if (endR < 0 || endR >= SIZE || endC < 0 || endC >= SIZE) continue
        let fits = true
        for (let k = 0; k < w.length; k++) {
          const cur = grid[r + dr * k][c + dc * k]
          if (cur && cur !== w[k]) { fits = false; break }
        }
        if (!fits) continue
        for (let k = 0; k < w.length; k++) grid[r + dr * k][c + dc * k] = w[k]
        placed = true
      }
      if (!placed) { ok = false; break }
    }
    if (ok) {
      for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++)
          if (!grid[r][c]) grid[r][c] = ALPHA[rand(26)]
      return grid
    }
  }
  return null
}

function lineCells(a, b) {
  const [r1, c1] = a
  const [r2, c2] = b
  const dR = r2 - r1
  const dC = c2 - c1
  const straight = r1 === r2 || c1 === c2 || Math.abs(dR) === Math.abs(dC)
  if (!straight) return null
  const len = Math.max(Math.abs(dR), Math.abs(dC)) + 1
  const sr = Math.sign(dR)
  const sc = Math.sign(dC)
  return Array.from({ length: len }, (_, k) => [r1 + sr * k, c1 + sc * k])
}

export default function Wend({ onComplete }) {
  const play = useSound()
  const words = content.wend.words

  const { grid, activeWords } = useMemo(() => {
    const fullGrid = generate(words)
    if (fullGrid) return { grid: fullGrid, activeWords: words }
    const fallbackWords = words.slice(0, 5)
    return { grid: generate(fallbackWords), activeWords: fallbackWords }
  }, [words])
  const [anchor, setAnchor] = useState(null)
  const [found, setFound] = useState([]) // list of found words
  const [foundCells, setFoundCells] = useState(new Set())

  const key = (r, c) => `${r},${c}`
  const remaining = activeWords.filter((w) => !found.includes(w))
  const solved = remaining.length === 0

  const clickCell = (r, c) => {
    if (solved || !grid) return
    if (!anchor) {
      play('click')
      setAnchor([r, c])
      return
    }
    if (anchor[0] === r && anchor[1] === c) {
      setAnchor(null) // tapped the same cell — cancel
      return
    }
    const cells = lineCells(anchor, [r, c])
    setAnchor(null)
    if (!cells) { play('error'); return }
    const str = cells.map(([rr, cc]) => grid[rr][cc]).join('')
    const rev = [...str].reverse().join('')
    const match = activeWords.find((w) => (w === str || w === rev) && !found.includes(w))
    if (match) {
      play('pop')
      setFound((f) => [...f, match])
      setFoundCells((s) => {
        const next = new Set(s)
        cells.forEach(([rr, cc]) => next.add(key(rr, cc)))
        return next
      })
    } else {
      play('error')
    }
  }

  useEffect(() => {
    if (!solved) return
    play('win')
    const t = setTimeout(() => onComplete(), 800)
    return () => clearTimeout(t)
  }, [solved, onComplete, play])

  if (!grid) return <p className="text-center text-[#7a5570]">Couldn’t build the board — try again.</p>

  return (
    <div className="text-center">
      <h2 className="gradient-text font-script text-3xl">Wend</h2>
      <p className="mt-1 text-[#7a5570]">
        Tap the first and last letter to trace each hidden word 💌
      </p>

      <div className="mx-auto mt-6 w-full max-w-md">
        <div className="grid grid-cols-9 gap-1 rounded-3xl bg-white/40 p-2">
          {grid.map((row, r) =>
            row.map((ch, c) => {
              const isAnchor = anchor && anchor[0] === r && anchor[1] === c
              const isFound = foundCells.has(key(r, c))
              return (
                <motion.button
                  key={key(r, c)}
                  whileTap={solved ? undefined : tap}
                  onClick={() => clickCell(r, c)}
                  disabled={solved}
                  aria-pressed={!!isAnchor}
                  aria-label={`Row ${r + 1}, column ${c + 1}, letter ${ch}${
                    isFound ? ', part of a found word' : isAnchor ? ', selected as start' : ''
                  }`}
                  className={`grid aspect-square place-items-center rounded-lg text-xs font-bold uppercase transition sm:text-sm ${
                    isFound
                      ? 'bg-gradient-to-br from-petal to-periwinkle text-white'
                      : isAnchor
                        ? 'bg-rose/30 text-rose ring-2 ring-rose'
                        : 'bg-white/90 text-[#6b4560] hover:bg-white'
                  }`}
                >
                  {ch}
                </motion.button>
              )
            }),
          )}
        </div>
      </div>

      <div className="mx-auto mt-5 flex max-w-md flex-wrap items-center justify-center gap-2">
        {activeWords.map((w) => {
          const isFound = found.includes(w)
          return (
            <span
              key={w}
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide transition ${
                isFound
                  ? 'bg-mint/60 text-emerald-700 line-through'
                  : 'bg-white/70 text-rose'
              }`}
            >
              {w}
            </span>
          )
        })}
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-rose/60">
        {solved ? 'you found them all 💗' : `${found.length} / ${activeWords.length} found`}
      </p>
    </div>
  )
}
