import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useSound } from '../hooks/useSound'
import { tap } from '../lib/motion'

// LinkedIn "Mini Sudoku" style: 6×6 grid, boxes are 2 rows × 3 cols.
// Every row, column and box holds 1–6 exactly once.
const N = 6

// null = empty & editable; a number = a locked clue.
const PUZZLE = [
  [1, null, 3, null, 5, null],
  [null, 5, null, 1, null, 3],
  [2, null, null, null, 6, null],
  [null, 6, 4, null, null, 1],
  [3, null, 2, null, 4, null],
  [null, 4, null, 3, null, 2],
]

const LOCKED = new Set()
PUZZLE.forEach((row, r) =>
  row.forEach((v, c) => {
    if (v != null) LOCKED.add(r * N + c)
  }),
)

function makeGrid() {
  return PUZZLE.map((row) => [...row])
}

function analyze(grid) {
  const bad = new Set()
  const check = (cells) => {
    const seen = {}
    for (const [r, c] of cells) {
      const v = grid[r][c]
      if (v == null) continue
      ;(seen[v] = seen[v] || []).push([r, c])
    }
    Object.values(seen).forEach((list) => {
      if (list.length > 1) list.forEach(([r, c]) => bad.add(`${r},${c}`))
    })
  }

  for (let r = 0; r < N; r++) check(Array.from({ length: N }, (_, c) => [r, c]))
  for (let c = 0; c < N; c++) check(Array.from({ length: N }, (_, r) => [r, c]))
  for (let br = 0; br < N; br += 2) {
    for (let bc = 0; bc < N; bc += 3) {
      const cells = []
      for (let r = br; r < br + 2; r++) for (let c = bc; c < bc + 3; c++) cells.push([r, c])
      check(cells)
    }
  }

  const full = grid.every((row) => row.every((v) => v != null))
  return { bad, full, solved: full && bad.size === 0 }
}

export default function MiniSudoku({ onComplete }) {
  const play = useSound()
  const [grid, setGrid] = useState(makeGrid)
  const [sel, setSel] = useState(null) // [r,c]
  const { bad, solved } = useMemo(() => analyze(grid), [grid])

  const select = (r, c) => {
    if (LOCKED.has(r * N + c) || solved) return
    play('click')
    setSel([r, c])
  }

  const setValue = (val) => {
    if (!sel || solved) return
    const [r, c] = sel
    if (LOCKED.has(r * N + c)) return
    play(val == null ? 'click' : 'flip')
    setGrid((g) => g.map((row, ri) => row.map((v, ci) => (ri === r && ci === c ? val : v))))
  }

  // fire completion once the board is valid & full
  useEffect(() => {
    if (!solved) return
    play('win')
    const t = setTimeout(() => onComplete(), 800)
    return () => clearTimeout(t)
  }, [solved, onComplete, play])

  return (
    <div className="text-center">
      <h2 className="gradient-text font-script text-3xl">Mini Sudoku</h2>
      <p className="mt-1 text-[#7a5570]">
        Fill every row, column and box with 1–6 — no repeats 💛
      </p>

      <div className="mx-auto mt-6 grid w-full max-w-xs grid-rows-3 gap-1.5">
        {[0, 1, 2].map((boxRow) => (
          <div key={boxRow} className="grid grid-cols-2 gap-1.5">
            {[0, 1].map((boxCol) => (
              <div key={boxCol} className="grid grid-cols-3 gap-1 rounded-xl bg-white/40 p-1">
                {[0, 1].map((dr) =>
                  [0, 1, 2].map((dc) => {
                    const r = boxRow * 2 + dr
                    const c = boxCol * 3 + dc
                    const v = grid[r][c]
                    const locked = LOCKED.has(r * N + c)
                    const isBad = bad.has(`${r},${c}`)
                    const isSel = sel && sel[0] === r && sel[1] === c
                    return (
                      <button
                        key={`${r}-${c}`}
                        onClick={() => select(r, c)}
                        className={`grid aspect-square place-items-center rounded-lg text-lg font-bold transition sm:text-xl ${
                          locked
                            ? 'bg-gradient-to-br from-petal/60 to-periwinkle/60 text-[#5a3a55]'
                            : 'bg-white/90 text-rose hover:bg-white'
                        } ${isSel ? 'ring-2 ring-periwinkle' : ''} ${
                          isBad ? 'ring-2 ring-rose' : ''
                        }`}
                      >
                        {v ?? ''}
                      </button>
                    )
                  }),
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* number pad */}
      <div className="mx-auto mt-5 flex max-w-xs flex-wrap items-center justify-center gap-2">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <motion.button
            key={n}
            whileTap={tap}
            onClick={() => setValue(n)}
            disabled={!sel || solved}
            className="grid h-11 w-11 place-items-center rounded-xl bg-white/80 text-lg font-bold text-[#6b4560] shadow-soft transition hover:bg-white disabled:opacity-40"
          >
            {n}
          </motion.button>
        ))}
        <motion.button
          whileTap={tap}
          onClick={() => setValue(null)}
          disabled={!sel || solved}
          className="grid h-11 w-11 place-items-center rounded-xl bg-white/80 text-lg text-rose shadow-soft transition hover:bg-white disabled:opacity-40"
          aria-label="Clear cell"
        >
          ⌫
        </motion.button>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-rose/60">
        {solved ? 'perfect — every piece in place 💗' : 'pick a cell, then a number'}
      </p>
    </div>
  )
}
