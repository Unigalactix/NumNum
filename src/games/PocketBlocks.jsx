import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useSound } from '../hooks/useSound'
import { tap } from '../lib/motion'

const ROWS = 16
const COLUMNS = 10
const GOAL = 3
const COLORS = ['bg-rose', 'bg-periwinkle', 'bg-mint', 'bg-peach', 'bg-sky-300']
const SHAPES = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
]

function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLUMNS).fill(null))
}

function makePiece() {
  const type = Math.floor(Math.random() * SHAPES.length)
  const shape = SHAPES[type].map((row) => [...row])
  return {
    shape,
    color: type,
    row: 0,
    column: Math.floor((COLUMNS - shape[0].length) / 2),
  }
}

function canPlace(board, piece, row = piece.row, column = piece.column, shape = piece.shape) {
  return shape.every((shapeRow, rowOffset) =>
    shapeRow.every((filled, columnOffset) => {
      if (!filled) return true
      const boardRow = row + rowOffset
      const boardColumn = column + columnOffset
      return (
        boardRow >= 0 &&
        boardRow < ROWS &&
        boardColumn >= 0 &&
        boardColumn < COLUMNS &&
        board[boardRow][boardColumn] === null
      )
    }),
  )
}

function rotateShape(shape) {
  return shape[0].map((_, column) => shape.map((row) => row[column]).reverse())
}

function mergePiece(board, piece) {
  const next = board.map((row) => [...row])
  piece.shape.forEach((shapeRow, rowOffset) => {
    shapeRow.forEach((filled, columnOffset) => {
      if (filled) next[piece.row + rowOffset][piece.column + columnOffset] = piece.color
    })
  })
  return next
}

function clearFullLines(board) {
  const remaining = board.filter((row) => row.some((cell) => cell === null))
  const cleared = ROWS - remaining.length
  return {
    board: [
      ...Array.from({ length: cleared }, () => Array(COLUMNS).fill(null)),
      ...remaining,
    ],
    cleared,
  }
}

export default function PocketBlocks({ onComplete }) {
  const play = useSound()
  const [board, setBoard] = useState(emptyBoard)
  const [piece, setPiece] = useState(makePiece)
  const [lines, setLines] = useState(0)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const solved = lines >= GOAL
  const controlsRef = useRef(null)

  const visibleBoard = useMemo(() => {
    const next = board.map((row) => [...row])
    if (gameOver) return next
    piece.shape.forEach((shapeRow, rowOffset) => {
      shapeRow.forEach((filled, columnOffset) => {
        const row = piece.row + rowOffset
        const column = piece.column + columnOffset
        if (filled && row >= 0 && row < ROWS && column >= 0 && column < COLUMNS) {
          next[row][column] = piece.color
        }
      })
    })
    return next
  }, [board, gameOver, piece])

  const lockPiece = () => {
    const merged = mergePiece(board, piece)
    const result = clearFullLines(merged)
    const nextPiece = makePiece()
    setBoard(result.board)
    setLines((current) => current + result.cleared)
    setScore((current) => current + 10 + result.cleared * 100)
    if (result.cleared > 0) play('flip')
    if (!canPlace(result.board, nextPiece)) {
      play('error')
      setGameOver(true)
    } else {
      setPiece(nextPiece)
    }
  }

  const move = (amount) => {
    if (gameOver || solved) return
    const column = piece.column + amount
    if (canPlace(board, piece, piece.row, column)) {
      play('click')
      setPiece((current) => ({ ...current, column }))
    }
  }

  const rotate = () => {
    if (gameOver || solved) return
    const shape = rotateShape(piece.shape)
    if (canPlace(board, piece, piece.row, piece.column, shape)) {
      play('click')
      setPiece((current) => ({ ...current, shape }))
    }
  }

  const drop = () => {
    if (gameOver || solved) return
    const row = piece.row + 1
    if (canPlace(board, piece, row, piece.column)) {
      setPiece((current) => ({ ...current, row }))
    } else {
      lockPiece()
    }
  }

  const restart = () => {
    play('click')
    setBoard(emptyBoard())
    setPiece(makePiece())
    setLines(0)
    setScore(0)
    setGameOver(false)
  }

  controlsRef.current = { drop, move, rotate }

  useEffect(() => {
    if (gameOver || solved) return
    const timer = setInterval(() => controlsRef.current.drop(), 560)
    return () => clearInterval(timer)
  }, [gameOver, solved])

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'ArrowLeft') controlsRef.current.move(-1)
      else if (event.key === 'ArrowRight') controlsRef.current.move(1)
      else if (event.key === 'ArrowUp') controlsRef.current.rotate()
      else if (event.key === 'ArrowDown') controlsRef.current.drop()
      else return
      event.preventDefault()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    if (!solved) return
    play('win')
    const timer = setTimeout(() => onComplete(), 900)
    return () => clearTimeout(timer)
  }, [onComplete, play, solved])

  return (
    <div className="text-center">
      <h2 className="gradient-text font-script text-3xl">Pocket Blocks</h2>
      <p className="mt-1 text-[#7a5570]">Fit the falling pieces and clear {GOAL} lines to win.</p>

      <div className="mx-auto mt-3 flex max-w-xs justify-between text-sm font-bold text-rose">
        <span>lines {lines} / {GOAL}</span>
        <span>score {score}</span>
      </div>

      <div className="relative mx-auto mt-3 aspect-[10/16] w-full max-w-xs overflow-hidden rounded-2xl bg-white/45 p-2 shadow-inner">
        <div className="grid h-full grid-cols-10 grid-rows-[repeat(16,minmax(0,1fr))] gap-0.5">
          {visibleBoard.flatMap((row, rowIndex) =>
            row.map((color, columnIndex) => (
              <div
                key={`${rowIndex}-${columnIndex}`}
                className={`rounded-[3px] border border-white/60 ${
                  color === null ? 'bg-white/55' : COLORS[color]
                }`}
              />
            )),
          )}
        </div>
        {gameOver && (
          <div className="absolute inset-0 grid place-items-center bg-white/80 p-6 backdrop-blur-sm">
            <div>
              <p className="font-script text-3xl text-rose">One more try?</p>
              <motion.button whileTap={tap} onClick={restart} className="btn mt-4">
                ↺ restart
              </motion.button>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto mt-4 grid max-w-xs grid-cols-4 gap-2">
        <motion.button whileTap={tap} onClick={() => move(-1)} className="btn-ghost px-3" aria-label="Move left">
          ←
        </motion.button>
        <motion.button whileTap={tap} onClick={rotate} className="btn-ghost px-3" aria-label="Rotate piece">
          ↻
        </motion.button>
        <motion.button whileTap={tap} onClick={() => move(1)} className="btn-ghost px-3" aria-label="Move right">
          →
        </motion.button>
        <motion.button whileTap={tap} onClick={drop} className="btn-ghost px-3" aria-label="Move down">
          ↓
        </motion.button>
      </div>
    </div>
  )
}