import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const HEARTS = ['💗', '💕', '🩷', '✨']
const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Tiny hearts that trail the cursor on desktop (fine pointer) only.
export default function HeartTrail() {
  const [hearts, setHearts] = useState([])

  useEffect(() => {
    const finePointer = window.matchMedia?.('(pointer: fine)').matches
    if (prefersReduced || !finePointer) return
    let id = 0
    let last = 0
    const onMove = (e) => {
      const now = performance.now()
      if (now - last < 90) return // throttle spawns
      last = now
      const heart = {
        id: id++,
        x: e.clientX,
        y: e.clientY,
        emoji: HEARTS[Math.floor(Math.random() * HEARTS.length)],
      }
      setHearts((h) => [...h.slice(-14), heart])
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[55] overflow-hidden">
      <AnimatePresence>
        {hearts.map((h) => (
          <motion.span
            key={h.id}
            initial={{ opacity: 0.9, scale: 1, x: h.x - 8, y: h.y - 8 }}
            animate={{ opacity: 0, scale: 0.4, y: h.y - 48 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            onAnimationComplete={() =>
              setHearts((list) => list.filter((x) => x.id !== h.id))
            }
            className="absolute text-sm"
          >
            {h.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}
