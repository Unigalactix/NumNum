import { motion } from 'framer-motion'
import { content } from '../content'
import { useSound } from '../hooks/useSound'
import { pageTransition, tap } from '../lib/motion'

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
  const moments = content.history || []

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-16">
      <motion.button
        whileTap={tap}
        onClick={() => {
          play('click')
          onClose()
        }}
        className="btn-ghost mb-6"
      >
        ← back
      </motion.button>

      <motion.header {...pageTransition} className="text-center">
        <div className="text-5xl">🗓️</div>
        <h2 className="gradient-text mt-2 font-script text-4xl sm:text-5xl">History of Us</h2>
        <p className="mt-2 text-[#7a5570]">the little dates that became our story 💗</p>
      </motion.header>

      <div className="relative mx-auto mt-10 max-w-2xl">
        <div className="absolute bottom-5 left-[1.15rem] top-5 w-0.5 bg-gradient-to-b from-rose via-periwinkle to-mint sm:left-1/2 sm:-translate-x-1/2" />

        <div className="space-y-6">
          {moments.map((moment, index) => {
            const right = index % 2 === 1
            return (
              <motion.article
                key={`${moment.date}-${moment.title}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                className={`relative grid items-center pl-14 sm:grid-cols-2 sm:pl-0 ${
                  right ? 'sm:[&>div]:col-start-2 sm:[&>div]:ml-8' : 'sm:[&>div]:mr-8'
                }`}
              >
                <div className="glass rounded-3xl p-5 text-left">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{moment.emoji}</span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-rose/70">
                        {moment.date}
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-[#6b4560]">{moment.title}</h3>
                      {moment.detail && (
                        <p className="mt-1 text-sm leading-relaxed text-[#7a5570]">
                          {moment.detail}
                        </p>
                      )}
                      {moment.since && (
                        <p className="mt-3 inline-flex rounded-full bg-petal/70 px-3 py-1 text-xs font-bold text-rose">
                          {daysSince(moment.since)} days {moment.countLabel} 💗
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <span className="absolute left-[0.7rem] top-1/2 grid h-4 w-4 -translate-y-1/2 place-items-center rounded-full bg-rose ring-4 ring-white/80 sm:left-1/2 sm:-translate-x-1/2" />
              </motion.article>
            )
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: moments.length * 0.07 }}
        className="mt-10 text-center font-script text-3xl text-rose"
      >
        and we’re only getting started… 💞
      </motion.div>
    </div>
  )
}