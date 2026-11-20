import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, History as HistoryIcon } from 'lucide-react'
import { gentle } from '../lib/motion'

const MONTHS = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
}

const DAY_MS = 24 * 60 * 60 * 1000

function parseMomentDate(dateText) {
  const match = /^([A-Za-z]+) (\d+)(?:st|nd|rd|th).*?(\d{4})$/.exec(dateText.trim())
  if (!match || !(match[1] in MONTHS)) return null
  return { month: MONTHS[match[1]], day: Number(match[2]), year: Number(match[3]) }
}

function pickThrowback(moments) {
  const today = new Date()
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())

  const parsed = moments
    .map((moment) => ({ moment, parsed: parseMomentDate(moment.date) }))
    .filter((entry) => entry.parsed)

  // A true "on this day": same month and day, from an earlier year.
  const exact = parsed.filter(
    (entry) =>
      entry.parsed.month === today.getMonth() &&
      entry.parsed.day === today.getDate() &&
      entry.parsed.year < today.getFullYear(),
  )
  if (exact.length > 0) {
    return { moment: exact[0].moment, kind: 'exact', daysAgo: null }
  }

  // Otherwise, a rotating throwback: one older memory per day, so it
  // changes daily and eventually revisits every moment.
  const candidates = parsed
    .map((entry) => {
      const utc = Date.UTC(entry.parsed.year, entry.parsed.month, entry.parsed.day)
      return { ...entry, daysAgo: Math.floor((todayUtc - utc) / DAY_MS) }
    })
    .filter((entry) => entry.parsed.year >= 2026 && entry.daysAgo >= 30)
  if (candidates.length === 0) return null

  const dayOfYear = Math.floor(
    (todayUtc - Date.UTC(today.getFullYear(), 0, 0)) / DAY_MS,
  )
  const pick = candidates[dayOfYear % candidates.length]
  return { moment: pick.moment, kind: 'throwback', daysAgo: pick.daysAgo }
}

export default function OnThisDay({ moments, onJump }) {
  const reduceMotion = useReducedMotion()
  const result = pickThrowback(moments)
  if (!result) return null
  const { moment, kind, daysAgo } = result

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 18, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.5 }}
      transition={reduceMotion ? { duration: 0 } : gentle}
      className="surface mt-10 rounded-xl p-5 sm:p-6"
      aria-labelledby="on-this-day-title"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blush/55 text-wine">
          <HistoryIcon size={17} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <div>
          <p className="editorial-label text-wine">
            {kind === 'exact' ? 'On this day' : 'A throwback for today'}
          </p>
          <h2 id="on-this-day-title" className="mt-2 font-display text-2xl leading-tight text-ink">
            {moment.emoji} {moment.title}
          </h2>
          <p className="mt-1 text-sm font-semibold text-muted">
            {moment.date}
            {daysAgo != null && ` · ${daysAgo} days ago`}
          </p>
          {moment.detail && (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{moment.detail}</p>
          )}
          <button type="button" onClick={() => onJump(moment.date)} className="btn-ghost mt-4 text-sm">
            <ArrowDown size={15} aria-hidden="true" />
            Jump to this moment
          </button>
        </div>
      </div>
    </motion.section>
  )
}
