import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Mail } from 'lucide-react'
import { content } from '../content'
import { useSound } from '../hooks/useSound'
import { tap } from '../lib/motion'
import Confetti from './Confetti'
import TypedLetter from './TypedLetter'

// The Love Letter (finale): an envelope that opens to the latest letter.
export default function FinaleLetter({ onClose, onOpenPrevious }) {
  const play = useSound()
  const { finale, her } = content
  const [open, setOpen] = useState(false)
  const [celebrate, setCelebrate] = useState(false)

  const openIt = () => {
    play('unlock')
    setOpen(true)
    setCelebrate(true)
    setTimeout(() => setCelebrate(false), 2500)
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-5 py-14 text-center">
      {celebrate && <Confetti />}

      <AnimatePresence mode="wait">
        {!open ? (
          <motion.button
            key="env"
            onClick={openIt}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="group relative w-full max-w-xl"
          >
            <div className="paper mx-auto grid aspect-[1.45/1] w-full max-w-sm place-items-center rounded-xl transition duration-300 group-hover:-translate-y-1 group-hover:shadow-soft">
              <span className="grid h-16 w-16 place-items-center rounded-xl bg-wine text-white">
                <Mail size={30} strokeWidth={1.5} aria-hidden="true" />
              </span>
            </div>
            <p className="editorial-label mt-8">The featured letter</p>
            <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">The Love Letter</h1>
            <p className="mt-3 text-sm text-muted">Open the envelope</p>
          </motion.button>
        ) : (
          <motion.div key="letter" className="flex w-full flex-col items-center">
            <TypedLetter
              letter={finale}
              footer={`— always yours, for ${her.nickname} 💞`}
            />
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {onOpenPrevious && (
                <motion.button
                  whileTap={tap}
                  onClick={() => {
                    play('click')
                    onOpenPrevious()
                  }}
                  className="btn"
                >
                  <BookOpen size={17} aria-hidden="true" />
                  Read previous letters
                </motion.button>
              )}
              <motion.button whileTap={tap} onClick={onClose} className="btn-ghost">
                <ArrowLeft size={17} aria-hidden="true" />
                back to our little world
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
