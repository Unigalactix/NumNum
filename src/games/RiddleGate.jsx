import { useState } from 'react'
import { motion } from 'framer-motion'
import { content } from '../content'
import { useStore } from '../store'
import { useSound } from '../hooks/useSound'

const normalize = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]/g, '').trim()

export default function RiddleGate() {
  const { gate, site, her } = content
  const enter = useStore((s) => s.enter)
  const play = useSound()
  const [value, setValue] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [error, setError] = useState(false)
  const [ok, setOk] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (normalize(value) === normalize(gate.answer)) {
      play('unlock')
      setError(false)
      setOk(true)
      setTimeout(() => enter(), 1900)
    } else {
      play('error')
      setError(true)
      setTimeout(() => setError(false), 600)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        className="glass w-full max-w-lg rounded-[2rem] p-8 text-center shadow-soft sm:p-10"
      >
        <motion.div
          className="mx-auto mb-4 text-6xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          💌
        </motion.div>

        <p className="font-sans text-sm font-semibold uppercase tracking-widest text-rose/70">
          {site.title}
        </p>
        <h1 className="gradient-text mt-2 font-script text-4xl sm:text-5xl">
          Hi {her.nickname} 💗
        </h1>

        {ok ? (
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 font-script text-2xl text-rose"
          >
            {gate.success}
          </motion.p>
        ) : (
          <>
            <p className="mt-5 text-lg leading-relaxed text-[#7a5570]">
              {gate.question}
            </p>

            <form onSubmit={submit} className="mt-6">
              <motion.input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="type your answer…"
                animate={error ? { x: [0, -10, 10, -8, 8, 0] } : {}}
                transition={{ duration: 0.5 }}
                className={`w-full rounded-full border-2 bg-white/80 px-6 py-4 text-center text-lg outline-none transition ${
                  error
                    ? 'border-rose'
                    : 'border-white focus:border-periwinkle'
                }`}
              />
              <button type="submit" className="btn mt-5 w-full text-lg">
                Unlock 💕
              </button>
            </form>

            <button
              onClick={() => {
                play('click')
                setShowHint(true)
              }}
              className="mt-4 text-sm font-semibold text-periwinkle underline-offset-4 hover:underline"
            >
              need a hint?
            </button>

            {showHint && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-2xl bg-white/70 p-4"
              >
                <p className="font-script text-xl text-rose">
                  I KNEW you'd click the hint 😏
                </p>
                <p className="mt-1 text-sm text-[#7a5570]">{gate.hint}</p>

                {showAnswer ? (
                  <p className="mt-3 text-base font-semibold text-periwinkle">
                    It's {gate.answer} 🥟💕
                  </p>
                ) : (
                  <button
                    onClick={() => {
                      play('click')
                      setShowAnswer(true)
                    }}
                    className="btn-ghost mt-3 text-sm"
                  >
                    reveal answer 👀
                  </button>
                )}
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
