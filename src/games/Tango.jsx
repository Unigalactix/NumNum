import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useSound } from '../hooks/useSound'
import { tap } from '../lib/motion'

// LinkedIn "Tango" style logic puzzle.
// Fill the 6×6 grid with 💗 and ⭐ so that:
//   • every row and column has exactly three of each
//   • no three of the same symbol touch in a line
const N = 6
const HEART = 0
const STAR = 1
const SYMS = ['💗', '⭐']

// A known-valid balanced solution (used only to seed the locked clue cells).
const SOLUTION = [
  [0, 0, 1, 1, 0, 1],
  [1, 1, 0, 0, 1, 0],
  [0, 1, 1, 0, 0, 1],
  [1, 0, 0, 1, 1, 0],
  [1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1],
]

const GIVENS = [
  [0, 0], [0, 2],
  [1, 1], [1, 4],
  [2, 5],
  [3, 0],
  [4, 2], [4, 4],
  [5, 1], [5, 3],
]

function makeGrid() {
  const locked = new Set(GIVENS.map(([r, c]) => r * N + c))
  const grid = Array.from({ length: N }, (_, r) =>
    Array.from({ length: N }, (_, c) => (locked.has(r * N + c) ? SOLUTION[r][c] : null)),
  )
  return grid
}

const LOCKED = new Set(GIVENS.map(([r, c]) => r * N + c))

function analyze(grid) {
  const bad = new Set()
  const mark = (r, c) => bad.add(`${r},${c}`)

  // three-in-a-row (horizontal + vertical)
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const v = grid[r][c]
      if (v == null) continue
      if (c <= N - 3 && grid[r][c + 1] === v && grid[r][c + 2] === v) {
        mark(r, c); mark(r, c + 1); mark(r, c + 2)
      }
      if (r <= N - 3 && grid[r + 1][c] === v && grid[r + 2][c] === v) {
        mark(r, c); mark(r + 1, c); mark(r + 2, c)
      }
    }
  }

  // more than three of a symbol in any row/column
  for (let i = 0; i < N; i++) {
    const rowCount = [0, 0]
    const colCount = [0, 0]
    for (let j = 0; j < N; j++) {
      if (grid[i][j] != null) rowCount[grid[i][j]]++
      if (grid[j][i] != null) colCount[grid[j][i]]++
    }
    ;[HEART, STAR].forEach((sym) => {
      if (rowCount[sym] > 3) for (let j = 0; j < N; j++) if (grid[i][j] === sym) mark(i, j)
      if (colCount[sym] > 3) for (let j = 0; j < N; j++) if (grid[j][i] === sym) mark(j, i)
    })
  }

  const full = grid.every((row) => row.every((v) => v != null))
  return { bad, full, solved: full && bad.size === 0 }
}

export default function Tango({ onComplete }) {
  const play = useSound()
  const [grid, setGrid] = useState(makeGrid)
  const { bad, solved } = useMemo(() => analyze(grid), [grid])

  const cycle = (r, c) => {
    if (LOCKED.has(r * N + c) || solved) return
    play('flip')
    setGrid((g) =>
      g.map((row, ri) =>
        row.map((v, ci) => {
          if (ri !== r || ci !== c) return v
          return v == null ? HEART : v === HEART ? STAR : null
        }),
      ),
    )
  }

  const clear = () => {
    play('click')
    setGrid(makeGrid())
  }

  useEffect(() => {
    if (!solved) return
    play('win')
    const t = setTimeout(() => onComplete(), 800)
    return () => clearTimeout(t)
  }, [solved, onComplete, play])

  return (
    <div className="text-center">
      <h2 className="gradient-text font-script text-3xl">Hearts &amp; Stars</h2>
      <p className="mt-1 text-[#7a5570]">
        Fill the grid — three 💗 and three ⭐ in every row and column, and never three in a row.
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-rose/60">
        tap a cell to cycle 💗 → ⭐ → empty
      </p>

      <div className="mx-auto mt-6 w-full max-w-sm">
        <div className="grid grid-cols-6 gap-1.5 rounded-3xl bg-white/50 p-2">
          {grid.map((row, r) =>
            row.map((v, c) => {
              const locked = LOCKED.has(r * N + c)
              const isBad = bad.has(`${r},${c}`)
              return (
                <motion.button
                  key={`${r}-${c}`}
                  whileTap={locked || solved ? undefined : tap}
                  onClick={() => cycle(r, c)}
                  className={`grid aspect-square place-items-center rounded-xl text-xl sm:text-2xl transition ${
                    locked
                      ? 'bg-gradient-to-br from-petal/70 to-periwinkle/70 shadow-inner'
                      : 'bg-white/90 hover:bg-white'
                  } ${isBad ? 'ring-2 ring-rose' : ''}`}
                >
                  <motion.span
                    key={v === null ? 'empty' : SYMS[v]}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    {v === null ? '' : SYMS[v]}
                  </motion.span>
                </motion.button>
              )
            }),
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <motion.button whileTap={tap} onClick={clear} className="btn-ghost">
          ↺ clear
        </motion.button>
        <span
          className={`rounded-full px-4 py-1.5 text-sm font-bold ${
            solved ? 'bg-mint/60 text-emerald-700' : 'bg-white/70 text-rose'
          }`}
        >
          {solved ? 'perfectly balanced 💗⭐' : 'keep going…'}
        </span>
      </div>
    </div>
  )
}
