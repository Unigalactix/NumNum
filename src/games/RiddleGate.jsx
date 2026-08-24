import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, KeyRound, Lightbulb } from 'lucide-react'
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
  const [almost, setAlmost] = useState(false)
  const [ok, setOk] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    const guess = normalize(value)
    const accepted = (gate.answers || [gate.answer]).map(normalize)
    if (accepted.includes(guess)) {
      play('unlock')
      setError(false)
      setAlmost(false)
      setOk(true)
      setTimeout(() => enter(), 1900)
    } else {
      play('error')
      // “Spider Man” alone isn't enough — nudge her gently to add the rest.
      setAlmost(guess.includes('spiderman') && !guess.includes('brandnewday'))
      setError(true)
      setTimeout(() => setError(false), 600)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(28rem,0.85fr)]">
      <div className="hidden border-r border-[#e4dde0] p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink font-display text-xl text-white">N</span>
          <span className="font-display text-xl text-ink">For My Num Num</span>
        </div>
        <div className="max-w-xl">
          <p className="editorial-label">A private keepsake</p>
          <p className="mt-5 font-display text-6xl leading-[0.98] text-ink">
            Every little thing worth remembering.
          </p>
          <div className="mt-10 h-px w-24 bg-wine" />
        </div>
        <p className="text-sm text-muted">Rajesh & Neha · 2026</p>
      </div>

      <div className="flex items-center justify-center p-5 sm:p-10">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        className="surface w-full max-w-lg rounded-2xl p-7 sm:p-10"
      >
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-blush/70 text-wine">
          <KeyRound size={21} strokeWidth={1.7} aria-hidden="true" />
        </span>

        <p className="editorial-label mt-8">Private entry</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-ink sm:text-5xl">
          Welcome, {her.nickname}.
        </h1>

        {ok ? (
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 border-l-2 border-wine pl-4 font-display text-2xl italic text-wine"
          >
            {gate.success}
          </motion.p>
        ) : (
          <>
            <p className="mt-5 text-base leading-relaxed text-muted">
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
                className={`w-full rounded-lg border bg-white px-4 py-3.5 text-left text-base text-ink outline-none transition ${
                  error
                    ? 'border-rose'
                    : 'border-[#d8ced2] focus:border-wine'
                }`}
              />
              <button type="submit" className="btn mt-4 w-full">
                Unlock archive
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </form>

            {almost && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-sm leading-relaxed text-wine"
              >
                {gate.almost}
              </motion.p>
            )}

            <button
              onClick={() => {
                play('click')
                setShowHint(true)
              }}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-wine"
            >
              <Lightbulb size={16} aria-hidden="true" />
              Need a hint?
            </button>

            {showHint && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 border-t border-[#e4dde0] pt-5"
              >
                <p className="font-display text-xl italic text-ink">
                  Seriously? You were asking for a hint on this question? 😏
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{gate.hint}</p>

                {showAnswer ? (
                  <p className="mt-4 text-sm font-semibold text-wine">
                    It's {gate.answer} 🎬💕
                  </p>
                ) : (
                  <button
                    onClick={() => {
                      play('click')
                      setShowAnswer(true)
                    }}
                    className="btn-ghost mt-3 text-sm"
                  >
                    <Eye size={16} aria-hidden="true" />
                    reveal answer
                  </button>
                )}
              </motion.div>
            )}
          </>
        )}
      </motion.div>
      </div>
    </div>
  )
}
