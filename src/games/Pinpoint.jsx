import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { content } from '../content'
import { useSound } from '../hooks/useSound'
import { spring, tap } from '../lib/motion'

// LinkedIn "Pinpoint" style: clues reveal one at a time; guess what connects them.
export default function Pinpoint({ onComplete }) {
  const play = useSound()
  const cfg = content.pinpoint
  const rounds = cfg.rounds

  const [round, setRound] = useState(0)
  const [revealed, setRevealed] = useState(1) // how many clues are shown
  const [wrong, setWrong] = useState([]) // wrong option indexes this round
  const [solved, setSolved] = useState(false)

  const r = rounds[round]
  const shuffledOptions = useMemo(
    () =>
      r.options
        .map((label, i) => ({ label, i }))
        .sort(() => Math.random() - 0.5),
    [round], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const choose = (i) => {
    if (solved || wrong.includes(i)) return
    if (i === r.answer) {
      play('pop')
      setSolved(true)
    } else {
      play('error')
      setWrong((w) => [...w, i])
      setRevealed((n) => Math.min(n + 1, r.clues.length))
    }
  }

  useEffect(() => {
    if (!solved) return
    const last = round + 1 >= rounds.length
    const timer = setTimeout(() => {
      if (last) {
        play('win')
        onComplete()
      } else {
        setRound((n) => n + 1)
        setRevealed(1)
        setWrong([])
        setSolved(false)
      }
    }, last ? 1600 : 1100)
    return () => clearTimeout(timer)
  }, [onComplete, play, round, rounds.length, solved])

  return (
    <div className="text-center">
      <h2 className="gradient-text font-script text-3xl">Pinpoint Us</h2>
      <p className="mt-1 text-[#7a5570]">{cfg.intro}</p>
      <p className="mt-1 text-sm font-semibold text-rose/70">
        Round {round + 1} of {rounds.length}
      </p>

      {/* clue stack */}
      <div className="mx-auto mt-6 grid max-w-md gap-2.5">
        {r.clues.map((clue, i) => {
          const shown = i < revealed
          return (
            <AnimatePresence key={i} mode="popLayout">
              {shown ? (
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={spring}
                  className="rounded-2xl border-2 border-white bg-white/80 px-5 py-3 text-left font-semibold text-[#6b4560] shadow-soft"
                >
                  <span className="mr-2 text-rose/70">{i + 1}.</span>
                  {clue}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border-2 border-dashed border-white/70 bg-white/30 px-5 py-3 text-left font-semibold text-rose/40"
                >
                  clue {i + 1} — locked
                </motion.div>
              )}
            </AnimatePresence>
          )
        })}
      </div>

      <p className="mt-5 text-sm font-semibold text-[#7a5570]">
        {solved ? 'Yesss — that’s it! 💗' : 'What do these clues have in common?'}
      </p>

      {/* options */}
      <div className="mx-auto mt-3 grid max-w-md gap-3">
        {shuffledOptions.map(({ label, i }) => {
          const isAnswer = solved && i === r.answer
          const isWrong = wrong.includes(i)
          return (
            <motion.button
              key={i}
              whileTap={tap}
              onClick={() => choose(i)}
              disabled={solved || isWrong}
              className={`rounded-2xl border-2 px-5 py-4 text-left font-semibold transition ${
                isAnswer
                  ? 'border-mint bg-mint/40'
                  : isWrong
                    ? 'border-rose/40 bg-rose/10 text-rose/50 line-through'
                    : 'border-white bg-white/70 hover:border-periwinkle'
              }`}
            >
              {label}
              {isAnswer && ' 💚'}
              {isWrong && ' 🥺'}
            </motion.button>
          )
        })}
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-rose/50">
        fewer clues = extra sweet 💫
      </p>
    </div>
  )
}
