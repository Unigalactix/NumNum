import { useMemo } from 'react'
import { motion } from 'framer-motion'

const COLORS = ['#ff8fb1', '#c9a0ff', '#ffd6e8', '#ffe0c7', '#c4f5e9', '#c9e6ff']

// A quick celebratory burst of confetti + hearts
export default function Confetti({ pieces = 60 }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 600,
        y: 200 + Math.random() * 500,
        rotate: Math.random() * 720 - 360,
        delay: Math.random() * 0.3,
        color: COLORS[i % COLORS.length],
        heart: Math.random() > 0.6,
        size: 8 + Math.random() * 10,
      })),
    [pieces],
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-start justify-center overflow-hidden">
      {bits.map((b) => (
        <motion.div
          key={b.id}
          initial={{ opacity: 1, x: 0, y: -20, rotate: 0 }}
          animate={{ opacity: 0, x: b.x, y: b.y, rotate: b.rotate }}
          transition={{ duration: 1.6 + Math.random(), delay: b.delay, ease: 'easeOut' }}
          className="absolute top-24"
          style={{ fontSize: b.size }}
        >
          {b.heart ? (
            <span style={{ color: b.color }}>❤</span>
          ) : (
            <span
              className="block rounded-[2px]"
              style={{ width: b.size, height: b.size * 0.6, background: b.color }}
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}
