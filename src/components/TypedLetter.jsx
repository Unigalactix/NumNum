import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// A glass letter card that "writes" its body out character-by-character.
// Every featured, archived, and future letter is rendered through this component.
// Reduced-motion users get the full text instantly.
export default function TypedLetter({ letter, footer, start = true }) {
  const { title, date, body, signoff } = letter
  const reduce = useReducedMotion()
  const [typed, setTyped] = useState('')

  useEffect(() => {
    if (!start) return
    if (reduce) {
      setTyped(body)
      return
    }
    setTyped('')
    let i = 0
    const id = setInterval(() => {
      i += 2
      setTyped(body.slice(0, i))
      if (i >= body.length) clearInterval(id)
    }, 24)
    return () => clearInterval(id)
  }, [start, reduce, body])

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: 40 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ type: 'spring', stiffness: 90, damping: 16 }}
      className="glass gradient-ring relative w-full max-w-xl rounded-[2rem] p-8 text-left sm:p-10"
    >
      <div className="pointer-events-none absolute -right-3 -top-3 text-4xl">🌸</div>
      <div className="pointer-events-none absolute -bottom-3 -left-3 text-4xl">💗</div>

      <h2 className="gradient-text font-script text-4xl">{title}</h2>
      {date && (
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-rose/60">
          {date}
        </p>
      )}
      <div className="mt-4 space-y-4 whitespace-pre-line text-lg leading-relaxed text-[#6b4560]">
        {typed}
        {!reduce && typed.length < body.length && (
          <span aria-hidden className="ml-0.5 inline-block">
            ▍
          </span>
        )}
      </div>
      <p className="mt-6 font-script text-2xl text-rose">{signoff}</p>
      {footer && <p className="mt-2 text-right text-sm text-[#7a5570]">{footer}</p>}
    </motion.div>
  )
}
