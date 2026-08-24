import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react'
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
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
      <button
        onClick={() => {
          play('click')
          onClose()
        }}
        className="icon-button mb-8"
        aria-label="Back to home"
        title="Back to home"
      >
        <ArrowLeft size={19} aria-hidden="true" />
      </button>

      <div className="max-w-2xl">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-blush/70 text-wine">
          <Mail size={21} strokeWidth={1.7} aria-hidden="true" />
        </span>
        <p className="editorial-label mt-7">The archive</p>
        <h1 className="mt-2 font-display text-5xl leading-none text-ink sm:text-6xl">Previous Letters</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">Every letter, dated and kept safely in one place.</p>
      </div>

      <AnimatePresence mode="wait">
        {openIdx === null ? (
          <motion.div key="list" {...pageTransition} className="mt-12 grid gap-4 sm:grid-cols-2">
            {letters.length === 0 ? (
              <p className="col-span-full text-center text-[#7a5570]">
                No letters yet — the first one is on its way 💗
              </p>
            ) : (
              letters.map((letter, index) => (
                <motion.button
                  key={`${letter.date}-${letter.title}`}
                  whileTap={tap}
                  whileHover={{ y: -3 }}
                  onClick={() => {
                    play('unlock')
                    setOpenIdx(index)
                  }}
                  className="surface group relative min-h-56 overflow-hidden rounded-xl p-6 text-left transition-colors hover:border-wine/35"
                >
                  <Mail size={20} strokeWidth={1.6} className="text-wine" aria-hidden="true" />
                  {letter.date && (
                    <p className="editorial-label mt-7 text-wine">
                      {letter.date}
                    </p>
                  )}
                  <h2 className="mt-2 font-display text-2xl leading-tight text-ink">{letter.title}</h2>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">
                    {letter.body.split('\n')[0]}
                  </p>
                  <span className="absolute bottom-5 right-5 text-wine transition-transform group-hover:translate-x-1">
                    <ArrowRight size={18} aria-hidden="true" />
                  </span>
                </motion.button>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div key="open" {...pageTransition} className="mt-8 flex flex-col items-center">
            <TypedLetter
              letter={letters[openIdx]}
              footer={`— always yours, for ${her.nickname} 💞`}
            />
            <button
              onClick={() => {
                play('click')
                setOpenIdx(null)
              }}
              className="btn-ghost mt-6"
            >
              <ArrowLeft size={17} aria-hidden="true" />
              all letters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
