import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, CalendarHeart } from 'lucide-react'
import { content } from '../content'
import { useSound } from '../hooks/useSound'
import { gentle, pageTransition, tap } from '../lib/motion'

const DAY_MS = 24 * 60 * 60 * 1000

function daysSince(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  const today = new Date()
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const eventUtc = Date.UTC(year, month - 1, day)
  return Math.max(0, Math.floor((todayUtc - eventUtc) / DAY_MS))
}

export default function HistoryOfUs({ onClose }) {
  const play = useSound()
  const reduceMotion = useReducedMotion()
  const moments = content.history || []
  const favorites = content.favorites || []

  return (
    <div className="mx-auto max-w-5xl overflow-x-hidden px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
      <motion.button
        whileTap={tap}
        onClick={() => {
          play('click')
          onClose()
        }}
        className="icon-button mb-8"
        aria-label="Back to home"
        title="Back to home"
      >
        <ArrowLeft size={19} aria-hidden="true" />
      </motion.button>

      <motion.header {...pageTransition} className="max-w-3xl">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-blush/70 text-wine">
          <CalendarHeart size={21} strokeWidth={1.7} aria-hidden="true" />
        </span>
        <p className="editorial-label mt-7">Our chronology</p>
        <h1 className="mt-2 font-display text-5xl leading-none text-ink sm:text-6xl">History of Us</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
          The dates we return to, and all the little moments that made them ours.
        </p>
      </motion.header>

      {favorites.length > 0 && (
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 18, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.5 }}
          transition={reduceMotion ? { duration: 0 } : gentle}
          className="mt-10 border-y border-[#e4dde0] py-6"
          aria-labelledby="favorite-things-title"
        >
          <h2 id="favorite-things-title" className="editorial-label">
            Num Num’s favorite things
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {favorites.map((favorite) => (
              <div
                key={favorite.label}
                className="flex items-center gap-3 text-sm font-semibold text-ink"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-lg shadow-soft" aria-hidden="true">{favorite.emoji}</span>
                {favorite.label}
              </div>
            ))}
          </div>
        </motion.section>
      )}

      <div className="relative mx-auto mt-14 max-w-4xl">
        <div className="absolute bottom-5 left-[1.15rem] top-5 w-px bg-[#d8ced2] sm:left-1/2 sm:-translate-x-1/2" />

        <div className="space-y-6">
          {moments.map((moment, index) => {
            const right = index % 2 === 1
            return (
              <motion.article
                key={`${moment.date}-${moment.title}`}
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        x: right ? 36 : -36,
                        y: 20,
                        scale: 0.96,
                        filter: 'blur(7px)',
                      }
                }
                whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.35 }}
                transition={reduceMotion ? { duration: 0 } : gentle}
                className={`relative grid items-center pl-14 sm:grid-cols-2 sm:pl-0 ${
                  right ? 'sm:[&>div]:col-start-2 sm:[&>div]:ml-8' : 'sm:[&>div]:mr-8'
                }`}
              >
                <div className="surface rounded-xl p-5 text-left sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blush/55 text-lg">{moment.emoji}</span>
                    <div>
                      <p className="editorial-label text-wine">
                        {moment.date}
                      </p>
                      <h3 className="mt-2 font-display text-xl leading-tight text-ink">{moment.title}</h3>
                      {moment.detail && (
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          {moment.detail}
                        </p>
                      )}
                      {moment.since && (
                        <p className="mt-4 border-l-2 border-wine/35 pl-3 text-xs font-semibold text-wine">
                          {daysSince(moment.since)} days {moment.countLabel}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <motion.span
                  initial={reduceMotion ? false : { scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 18 }}
                  className="absolute left-[0.82rem] top-1/2 grid h-3 w-3 -translate-y-1/2 place-items-center rounded-full bg-wine ring-4 ring-porcelain sm:left-1/2 sm:-translate-x-1/2"
                />
              </motion.article>
            )
          })}
        </div>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={reduceMotion ? { duration: 0 } : gentle}
        className="mt-14 text-center font-display text-3xl italic text-wine"
      >
        And we’re only getting started.
      </motion.div>
    </div>
  )
}