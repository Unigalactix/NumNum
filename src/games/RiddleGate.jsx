import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Delete, KeyRound } from 'lucide-react'
import { content } from '../content'
import { useStore } from '../store'
import { useSound } from '../hooks/useSound'

const PASSCODE_LENGTH = 6
const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

export default function RiddleGate() {
  const { gate, site, her } = content
  const enter = useStore((s) => s.enter)
  const play = useSound()
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [ok, setOk] = useState(false)

  const submit = () => {
    if (value.length !== PASSCODE_LENGTH || ok) return

    if (value === gate.passcode) {
      play('unlock')
      setError(false)
      setOk(true)
      setTimeout(() => enter(), 1900)
    } else {
      play('error')
      setError(true)
      setTimeout(() => {
        setError(false)
        setValue('')
      }, 600)
    }
  }

  const appendDigit = (digit) => {
    if (ok) return
    setError(false)
    setValue((current) => `${current}${digit}`.slice(0, PASSCODE_LENGTH))
  }

  const removeDigit = () => {
    if (ok) return
    setError(false)
    setValue((current) => current.slice(0, -1))
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (/^\d$/.test(event.key)) {
        event.preventDefault()
        appendDigit(event.key)
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault()
        removeDigit()
      } else if (event.key === 'Enter') {
        event.preventDefault()
        submit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

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

            <div className="mt-6">
              <motion.div
                role="status"
                aria-label={`${value.length} of ${PASSCODE_LENGTH} passcode digits entered`}
                animate={error ? { x: [0, -10, 10, -8, 8, 0] } : {}}
                transition={{ duration: 0.5 }}
                className={`grid grid-cols-6 gap-2 rounded-lg border bg-white p-3 transition ${
                  error
                    ? 'border-rose'
                    : 'border-[#d8ced2]'
                }`}
              >
                {Array.from({ length: PASSCODE_LENGTH }, (_, index) => (
                  <span
                    key={index}
                    aria-hidden="true"
                    className={`grid aspect-square place-items-center rounded-md border text-xl transition sm:text-2xl ${
                      index < value.length
                        ? 'border-wine/40 bg-blush/60 text-wine'
                        : 'border-[#e4dde0] bg-[#fcfafb] text-transparent'
                    }`}
                  >
                    {index < value.length ? '•' : '0'}
                  </span>
                ))}
              </motion.div>

              <div className="mx-auto mt-4 grid max-w-xs grid-cols-3 gap-2" aria-label="Passcode keypad">
                {KEYPAD.map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => {
                      play('click')
                      appendDigit(digit)
                    }}
                    className="grid h-12 place-items-center rounded-lg border border-[#d8ced2] bg-white text-lg font-semibold text-ink transition hover:border-wine hover:text-wine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2"
                    aria-label={`Enter ${digit}`}
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={removeDigit}
                  className="grid h-12 place-items-center rounded-lg border border-[#d8ced2] bg-white text-muted transition hover:border-wine hover:text-wine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2"
                  aria-label="Remove last digit"
                >
                  <ArrowLeft size={19} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    play('click')
                    appendDigit('0')
                  }}
                  className="grid h-12 place-items-center rounded-lg border border-[#d8ced2] bg-white text-lg font-semibold text-ink transition hover:border-wine hover:text-wine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2"
                  aria-label="Enter 0"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => setValue('')}
                  className="grid h-12 place-items-center rounded-lg border border-[#d8ced2] bg-white text-muted transition hover:border-wine hover:text-wine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2"
                  aria-label="Clear passcode"
                >
                  <Delete size={19} aria-hidden="true" />
                </button>
              </div>

              <button
                type="button"
                onClick={submit}
                disabled={value.length !== PASSCODE_LENGTH}
                className="btn mt-4 w-full disabled:cursor-not-allowed disabled:opacity-45"
              >
                Unlock archive
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          </>
        )}
      </motion.div>
      </div>
    </div>
  )
}
