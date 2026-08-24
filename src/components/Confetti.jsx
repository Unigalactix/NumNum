import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const COLORS = ['#8f4058', '#71867a', '#e7bcc8', '#d8ced2', '#f0e5df']

// A quick celebratory burst of confetti + hearts
export default function Confetti({ pieces = 36 }) {
  const reduce = useReducedMotion()
  const bits = useMemo(
    () =>
      Array.from({ length: reduce ? 0 : pieces }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 600,
        y: 200 + Math.random() * 500,
        rotate: Math.random() * 720 - 360,
        delay: Math.random() * 0.3,
        duration: 1.6 + Math.random(),
        color: COLORS[i % COLORS.length],
        heart: Math.random() > 0.82,
        size: 7 + Math.random() * 8,
      })),
    [pieces, reduce],
  )

  if (reduce) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-start justify-center overflow-hidden">
      {bits.map((b) => (
        <motion.div
          key={b.id}
          initial={{ opacity: 1, x: 0, y: -20, rotate: 0 }}
          animate={{ opacity: 0, x: b.x, y: b.y, rotate: b.rotate }}
          transition={{ duration: b.duration, delay: b.delay, ease: 'easeOut' }}
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
