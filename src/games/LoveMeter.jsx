import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { content } from '../content'
import { useSound } from '../hooks/useSound'

export default function LoveMeter({ onComplete }) {
  const play = useSound()
  const reasons = content.reasons
  const [count, setCount] = useState(0) // how many times pressed

  const pct = Math.min(100, (count / reasons.length) * 100)
  const revealed = reasons.slice(0, count)
  const full = count >= reasons.length

  const press = () => {
    if (full) {
      play('win')
      setTimeout(() => onComplete(), 400)
      return
    }
    play('pop')
    setCount((c) => c + 1)
  }

  return (
    <div className="text-center">
      <h2 className="gradient-text font-script text-3xl">The Love Meter</h2>
      <p className="mt-1 text-[#7a5570]">
        Keep pressing to see just how much… 💗
      </p>

      <div className="mx-auto mt-6 h-8 w-full max-w-md overflow-hidden rounded-full bg-white/60 p-1 shadow-inner">
        <motion.div
          className="flex h-full items-center justify-end rounded-full bg-gradient-to-r from-petal via-rose to-periwinkle pr-3 text-xs font-bold text-white"
          animate={{ width: `${Math.max(8, pct)}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 15 }}
        >
          {full ? '∞' : `${Math.round(pct)}%`}
        </motion.div>
      </div>

      <div className="mx-auto mt-6 grid max-w-md gap-2">
        <AnimatePresence>
          {revealed.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="rounded-2xl bg-white/70 px-4 py-3 font-semibold text-[#6b4560] shadow"
            >
              {r}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.button
        onClick={press}
        whileTap={{ scale: 0.9 }}
        className="btn mt-6 text-lg"
        animate={full ? { scale: [1, 1.06, 1] } : {}}
        transition={full ? { repeat: Infinity, duration: 1 } : {}}
      >
        {full ? 'It overflowed! continue 💖' : 'How much do you love me? 💞'}
      </motion.button>
    </div>
  )
}
