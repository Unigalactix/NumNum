import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { content } from '../content'
import { useSound } from '../hooks/useSound'

export default function Quiz({ onComplete }) {
  const play = useSound()
  const questions = content.quiz
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)

  const q = questions[step]

  const choose = (i) => {
    if (picked !== null) return
    setPicked(i)
    const correct = i === q.answer
    if (correct) {
      play('pop')
      setScore((s) => s + 1)
    } else {
      play('error')
    }
    setTimeout(() => {
      if (step + 1 < questions.length) {
        setStep((s) => s + 1)
        setPicked(null)
      } else {
        play('win')
        setTimeout(() => onComplete(), 500)
      }
    }, 1100)
  }

  return (
    <div className="text-center">
      <h2 className="gradient-text font-script text-3xl">How Well Do You Know Us?</h2>
      <p className="mt-1 text-sm font-semibold text-rose/70">
        Question {step + 1} of {questions.length}
      </p>

      <div className="mx-auto mt-3 h-2 w-full max-w-md overflow-hidden rounded-full bg-white/60">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-petal to-periwinkle"
          animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          className="mx-auto mt-6 max-w-md"
        >
          <p className="text-xl font-semibold text-[#6b4560]">{q.question}</p>
          <div className="mt-5 grid gap-3">
            {q.options.map((opt, i) => {
              const isCorrect = picked !== null && i === q.answer
              const isWrongPick = picked === i && i !== q.answer
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={picked !== null}
                  className={`rounded-2xl border-2 px-5 py-4 text-left font-semibold transition ${
                    isCorrect
                      ? 'border-mint bg-mint/40'
                      : isWrongPick
                        ? 'border-rose bg-rose/20'
                        : 'border-white bg-white/70 hover:border-periwinkle'
                  }`}
                >
                  {opt}
                  {isCorrect && ' 💚'}
                  {isWrongPick && ' 🥺'}
                </button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
