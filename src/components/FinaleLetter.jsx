import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { content } from '../content'
import { useSound } from '../hooks/useSound'
import { tap } from '../lib/motion'
import Confetti from './Confetti'

// The grand finale: an envelope that opens into the heartfelt letter
export default function FinaleLetter({ onClose }) {
  const play = useSound()
  const reduce = useReducedMotion()
  const { finale, her } = content
  const [open, setOpen] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const [typed, setTyped] = useState('')

  const openIt = () => {
    play('unlock')
    setOpen(true)
    setCelebrate(true)
    setTimeout(() => setCelebrate(false), 2500)
  }

  // Gently "write" the letter out, character by character. Reduced-motion
  // users (and anyone who reopens) get the full text instantly.
  useEffect(() => {
    if (!open) return
    if (reduce) {
      setTyped(finale.body)
      return
    }
    setTyped('')
    let i = 0
    const id = setInterval(() => {
      i += 2
      setTyped(finale.body.slice(0, i))
      if (i >= finale.body.length) clearInterval(id)
    }, 24)
    return () => clearInterval(id)
  }, [open, reduce, finale.body])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center">
      {celebrate && <Confetti />}

      <AnimatePresence mode="wait">
        {!open ? (
          <motion.button
            key="env"
            onClick={openIt}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
            transition={{ y: { repeat: Infinity, duration: 2 } }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="group relative"
          >
            <div className="text-[8rem] drop-shadow-[0_10px_30px_rgba(255,143,177,0.6)] transition group-hover:scale-105">
              💌
            </div>
            <p className="gradient-text mt-2 font-script text-3xl">
              One last letter…
            </p>
            <p className="mt-1 text-[#7a5570]">tap to open 💗</p>
          </motion.button>
        ) : (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 60, rotateX: 40 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ type: 'spring', stiffness: 90, damping: 16 }}
            className="glass gradient-ring relative w-full max-w-xl rounded-[2rem] p-8 text-left sm:p-10"
          >
            <div className="pointer-events-none absolute -right-3 -top-3 text-4xl">🌸</div>
            <div className="pointer-events-none absolute -bottom-3 -left-3 text-4xl">💗</div>

            <h2 className="gradient-text font-script text-4xl">{finale.title}</h2>
            <div className="mt-4 space-y-4 whitespace-pre-line text-lg leading-relaxed text-[#6b4560]">
              {typed}
              {!reduce && typed.length < finale.body.length && (
                <motion.span
                  aria-hidden
                  className="ml-0.5 inline-block"
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                >
                  ▍
                </motion.span>
              )}
            </div>
            <p className="mt-6 font-script text-2xl text-rose">{finale.signoff}</p>
            <p className="mt-2 text-right text-sm text-[#7a5570]">
              — always yours, for {her.nickname} 💞
            </p>

            <motion.button whileTap={tap} onClick={onClose} className="btn-ghost mt-8">
              ← back to our little world
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
