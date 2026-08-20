import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useSound } from '../hooks/useSound'
import { tap } from '../lib/motion'

// LinkedIn-style region tiling: color every patch so no two touching patches share a color.
const REGIONS = [
  ['A', 'A', 'B', 'B', 'B'],
  ['A', 'A', 'B', 'B', 'C'],
  ['D', 'D', 'E', 'E', 'C'],
  ['D', 'E', 'E', 'C', 'C'],
  ['D', 'F', 'F', 'F', 'F'],
]
const ROWS = REGIONS.length
const COLS = REGIONS[0].length

// pastel palette (rose, periwinkle, mint, peach)
const PALETTE = ['#ff9fb5', '#b8c0ff', '#bde8c8', '#ffd6a5']
const COLOR_NAMES = ['rose', 'periwinkle', 'mint', 'peach']

const REGION_IDS = [...new Set(REGIONS.flat())]

// edge-adjacency between regions
const ADJ = (() => {
  const set = new Set()
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const a = REGIONS[r][c]
      if (c + 1 < COLS) {
        const b = REGIONS[r][c + 1]
        if (a !== b) set.add([a, b].sort().join('-'))
      }
      if (r + 1 < ROWS) {
        const b = REGIONS[r + 1][c]
        if (a !== b) set.add([a, b].sort().join('-'))
      }
    }
  }
  return [...set].map((s) => s.split('-'))
})()

export default function Patches({ onComplete }) {
  const play = useSound()
  const [colors, setColors] = useState({}) // regionId -> palette index

  const { conflicts, solved } = useMemo(() => {
    const bad = new Set()
    for (const [a, b] of ADJ) {
      if (colors[a] != null && colors[a] === colors[b]) {
        bad.add(a)
        bad.add(b)
      }
    }
    const allColored = REGION_IDS.every((id) => colors[id] != null)
    return { conflicts: bad, solved: allColored && bad.size === 0 }
  }, [colors])

  const cycle = (id) => {
    if (solved) return
    play('flip')
    setColors((c) => {
      const cur = c[id]
      const next = cur == null ? 0 : cur + 1 >= PALETTE.length ? null : cur + 1
      return { ...c, [id]: next }
    })
  }

  useEffect(() => {
    if (!solved) return
    play('win')
    const t = setTimeout(() => onComplete(), 800)
    return () => clearTimeout(t)
  }, [solved, onComplete, play])

  const border = (r, c, dr, dc) => {
    const rr = r + dr
    const cc = c + dc
    if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) return true
    return REGIONS[rr][cc] !== REGIONS[r][c]
  }

  return (
    <div className="text-center">
      <h2 className="gradient-text font-script text-3xl">Patches</h2>
      <p className="mt-1 text-[#7a5570]">
        Color every patch so no two touching patches match 🎨
      </p>

      <div className="mx-auto mt-6 w-full max-w-xs">
        <div
          className="grid gap-0 overflow-hidden rounded-2xl"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
          {REGIONS.map((row, r) =>
            row.map((id, c) => {
              const idx = colors[id]
              const isBad = conflicts.has(id)
              const firstCell = REGIONS.flat().indexOf(id) === r * COLS + c
              return (
                <motion.button
                  key={`${r}-${c}`}
                  whileTap={solved ? undefined : tap}
                  onClick={() => cycle(id)}
                  disabled={solved}
                  tabIndex={firstCell ? 0 : -1}
                  aria-hidden={!firstCell}
                  aria-invalid={firstCell && isBad ? true : undefined}
                  aria-label={
                    firstCell
                      ? `Patch ${id}, ${idx == null ? 'uncolored' : COLOR_NAMES[idx]}${
                          isBad ? ', conflicts with a touching patch' : ''
                        }. Activate to change color.`
                      : undefined
                  }
                  className="aspect-square"
                  style={{
                    background: idx == null ? 'rgba(255,255,255,0.85)' : PALETTE[idx],
                    borderTop: `${border(r, c, -1, 0) ? 3 : 0}px solid ${isBad ? '#e11d64' : '#6b4560'}`,
                    borderBottom: `${border(r, c, 1, 0) ? 3 : 0}px solid ${isBad ? '#e11d64' : '#6b4560'}`,
                    borderLeft: `${border(r, c, 0, -1) ? 3 : 0}px solid ${isBad ? '#e11d64' : '#6b4560'}`,
                    borderRight: `${border(r, c, 0, 1) ? 3 : 0}px solid ${isBad ? '#e11d64' : '#6b4560'}`,
                  }}
                />
              )
            }),
          )}
        </div>
      </div>

      {/* palette legend */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {PALETTE.map((col, i) => (
          <span
            key={i}
            className="h-6 w-6 rounded-full shadow-soft"
            style={{ background: col }}
          />
        ))}
        <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-rose/60">
          tap a patch to recolor
        </span>
      </div>

      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-rose/60">
        {solved ? 'every patch, its own happy color 💗' : 'no touching patches may match'}
      </p>
    </div>
  )
}
