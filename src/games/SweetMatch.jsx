import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useSound } from '../hooks/useSound'
import { tap } from '../lib/motion'

const SIZE = 6
const TARGET = 300
const SWEETS = ['🍬', '🍭', '🧁', '🍩', '🍪']

const rowOf = (index) => Math.floor(index / SIZE)
const columnOf = (index) => index % SIZE
const adjacent = (first, second) =>
  Math.abs(rowOf(first) - rowOf(second)) +
    Math.abs(columnOf(first) - columnOf(second)) ===
  1

function randomSweet() {
  return SWEETS[Math.floor(Math.random() * SWEETS.length)]
}

function makeBoard() {
  const board = []
  for (let index = 0; index < SIZE * SIZE; index++) {
    let sweet = randomSweet()
    while (
      (columnOf(index) >= 2 && board[index - 1] === sweet && board[index - 2] === sweet) ||
      (rowOf(index) >= 2 && board[index - SIZE] === sweet && board[index - SIZE * 2] === sweet)
    ) {
      sweet = randomSweet()
    }
    board.push(sweet)
  }
  return board
}

function findMatches(board) {
  const matches = new Set()

  for (let row = 0; row < SIZE; row++) {
    let runStart = 0
    for (let column = 1; column <= SIZE; column++) {
      const same =
        column < SIZE && board[row * SIZE + column] === board[row * SIZE + runStart]
      if (same) continue
      if (column - runStart >= 3) {
        for (let matched = runStart; matched < column; matched++) {
          matches.add(row * SIZE + matched)
        }
      }
      runStart = column
    }
  }

  for (let column = 0; column < SIZE; column++) {
    let runStart = 0
    for (let row = 1; row <= SIZE; row++) {
      const same =
        row < SIZE && board[row * SIZE + column] === board[runStart * SIZE + column]
      if (same) continue
      if (row - runStart >= 3) {
        for (let matched = runStart; matched < row; matched++) {
          matches.add(matched * SIZE + column)
        }
      }
      runStart = row
    }
  }

  return matches
}

function dropSweets(board, matches) {
  const next = Array(SIZE * SIZE)
  for (let column = 0; column < SIZE; column++) {
    const remaining = []
    for (let row = SIZE - 1; row >= 0; row--) {
      const index = row * SIZE + column
      if (!matches.has(index)) remaining.push(board[index])
    }
    for (let row = SIZE - 1; row >= 0; row--) {
      next[row * SIZE + column] = remaining[SIZE - 1 - row] || randomSweet()
    }
  }
  return next
}

function resolveMatches(board) {
  let next = board
  let removed = 0
  let matches = findMatches(next)
  let cascades = 0

  while (matches.size > 0 && cascades < 12) {
    removed += matches.size
    next = dropSweets(next, matches)
    matches = findMatches(next)
    cascades++
  }

  return { board: next, points: removed * 10 }
}

export default function SweetMatch({ onComplete }) {
  const play = useSound()
  const [board, setBoard] = useState(makeBoard)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)
  const solved = score >= TARGET
  const progress = useMemo(() => Math.min(100, (score / TARGET) * 100), [score])

  const choose = (index) => {
    if (solved) return
    if (selected === null) {
      play('click')
      setSelected(index)
      return
    }
    if (selected === index) {
      setSelected(null)
      return
    }
    if (!adjacent(selected, index)) {
      play('click')
      setSelected(index)
      return
    }

    const swapped = [...board]
    ;[swapped[selected], swapped[index]] = [swapped[index], swapped[selected]]
    const matches = findMatches(swapped)
    setSelected(null)

    if (matches.size === 0) {
      play('error')
      return
    }

    const result = resolveMatches(swapped)
    play('flip')
    setBoard(result.board)
    setScore((current) => current + result.points)
    setMoves((current) => current + 1)
  }

  useEffect(() => {
    if (!solved) return
    play('win')
    const timer = setTimeout(() => onComplete(), 900)
    return () => clearTimeout(timer)
  }, [onComplete, play, solved])

  return (
    <div className="text-center">
      <h2 className="gradient-text font-script text-3xl">Sweet Match</h2>
      <p className="mt-1 text-[#7a5570]">
        Swap neighboring treats and match three or more. Reach {TARGET} points to win.
      </p>

      <div className="mx-auto mt-4 flex max-w-sm items-center gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/70">
          <motion.div
            animate={{ width: `${progress}%` }}
            className="h-full rounded-full bg-gradient-to-r from-rose to-periwinkle"
          />
        </div>
        <span className="min-w-20 text-sm font-bold text-rose">{score} / {TARGET}</span>
      </div>

      <div className="mx-auto mt-5 grid w-full max-w-sm grid-cols-6 gap-1.5 rounded-3xl bg-white/45 p-2 sm:gap-2 sm:p-3">
        {board.map((sweet, index) => (
          <motion.button
            key={index}
            whileTap={solved ? undefined : tap}
            onClick={() => choose(index)}
            aria-label={`${sweet} at row ${rowOf(index) + 1}, column ${columnOf(index) + 1}`}
            className={`grid aspect-square place-items-center rounded-xl text-2xl transition sm:text-3xl ${
              selected === index
                ? 'bg-petal/90 ring-2 ring-rose shadow-soft'
                : 'bg-white/90 hover:bg-white'
            }`}
          >
            <motion.span key={sweet} initial={{ scale: 0.65 }} animate={{ scale: 1 }}>
              {sweet}
            </motion.span>
          </motion.button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <motion.button
          whileTap={tap}
          onClick={() => {
            play('click')
            setBoard(makeBoard())
            setSelected(null)
          }}
          className="btn-ghost"
        >
          ↻ mix the sweets
        </motion.button>
        <span className="rounded-full bg-white/70 px-4 py-1.5 text-xs font-semibold text-rose">
          {moves} {moves === 1 ? 'move' : 'moves'}
        </span>
      </div>
    </div>
  )
}