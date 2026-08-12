import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { content } from '../content'
import { useSound } from '../hooks/useSound'
import { tap, pageTransition } from '../lib/motion'
import TypedLetter from './TypedLetter'

// An archive of every letter written so far. Each opens with the same
// envelope + typewriter feel as the finale, and shows when it was written.
export default function PreviousLetters({ onClose }) {
  const play = useSound()
  const her = content.her
  const letters = content.previousLetters || []
  const [openIdx, setOpenIdx] = useState(null)

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-16">
      <button
        onClick={() => {
          play('click')
          onClose()
        }}
        className="btn-ghost mb-6"
      >
        ← back
      </button>

      <div className="text-center">
        <h2 className="gradient-text font-script text-4xl sm:text-5xl">Previous Letters</h2>
        <p className="mt-2 text-[#7a5570]">every letter I’ve written you, kept safe 💌</p>
      </div>

      <AnimatePresence mode="wait">
        {openIdx === null ? (
          <motion.div key="list" {...pageTransition} className="mt-8 grid gap-5 sm:grid-cols-2">
            {letters.length === 0 ? (
              <p className="col-span-full text-center text-[#7a5570]">
                No letters yet — the first one is on its way 💗
              </p>
            ) : (
              letters.map((l, i) => (
                <motion.button
                  key={i}
                  whileTap={tap}
                  whileHover={{ y: -6 }}
                  onClick={() => {
                    play('unlock')
                    setOpenIdx(i)
                  }}
                  className="glass relative overflow-hidden rounded-3xl p-6 text-left"
                >
                  <div className="text-4xl">💌</div>
                  <h3 className="mt-3 text-xl font-bold text-[#6b4560]">{l.title}</h3>
                  {l.date && (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-rose/60">
                      {l.date}
                    </p>
                  )}
                  <span className="absolute right-4 top-4 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-rose">
                    open
                  </span>
                </motion.button>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div key="open" {...pageTransition} className="mt-8 flex flex-col items-center">
            <TypedLetter
              title={letters[openIdx].title}
              date={letters[openIdx].date}
              body={letters[openIdx].body}
              signoff={letters[openIdx].signoff}
              footer={`— always yours, for ${her.nickname} 💞`}
            />
            <button
              onClick={() => {
                play('click')
                setOpenIdx(null)
              }}
              className="btn-ghost mt-6"
            >
              ← all letters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
