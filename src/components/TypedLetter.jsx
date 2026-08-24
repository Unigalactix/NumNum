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
      initial={reduce ? false : { opacity: 0, y: 28, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="paper relative w-full max-w-2xl rounded-xl px-7 py-10 text-left sm:px-12 sm:py-14"
    >
      <div className="mb-8 h-px w-12 bg-wine" />
      <h2 className="font-display text-4xl leading-tight text-ink sm:text-5xl">{title}</h2>
      {date && (
        <p className="editorial-label mt-3 text-wine">
          {date}
        </p>
      )}
      <div className="mt-8 whitespace-pre-line font-display text-xl leading-[1.75] text-ink sm:text-[1.35rem]">
        {typed}
        {!reduce && typed.length < body.length && (
          <span aria-hidden className="ml-0.5 inline-block">
            ▍
          </span>
        )}
      </div>
      <p className="mt-10 font-script text-2xl text-wine">{signoff}</p>
      {footer && <p className="mt-3 border-t border-[#e8e0dc] pt-4 text-right text-xs font-semibold text-muted">{footer}</p>}
    </motion.div>
  )
}
