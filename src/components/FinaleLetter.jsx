import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { content } from '../content'
import { useSound } from '../hooks/useSound'
import { tap } from '../lib/motion'
import Confetti from './Confetti'
import TypedLetter from './TypedLetter'

// The Love Letter (finale): an envelope that opens to the latest letter.
// Right now it's awaiting a new one — past letters live in Previous Letters.
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
            <p className="gradient-text mt-2 font-script text-3xl">The Love Letter</p>
            <p className="mt-1 text-[#7a5570]">tap to open 💗</p>
          </motion.button>
        ) : (
          <motion.div key="letter" className="flex w-full flex-col items-center">
            <TypedLetter
              title={finale.title}
              date={finale.date}
              body={finale.body}
              signoff={finale.signoff}
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
                  📜 Read previous letters
                </motion.button>
              )}
              <motion.button whileTap={tap} onClick={onClose} className="btn-ghost">
                ← back to our little world
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
