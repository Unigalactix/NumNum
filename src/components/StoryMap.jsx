import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, MapPin } from 'lucide-react'
import { gentle } from '../lib/motion'

export default function StoryMap({ places, moments, onJump }) {
  const reduceMotion = useReducedMotion()
  const [selectedName, setSelectedName] = useState('Snoqualmie Falls')

  const momentByDate = useMemo(() => {
    const map = new Map()
    moments.forEach((moment, index) => map.set(moment.date, { moment, index }))
    return map
  }, [moments])

  const routePoints = useMemo(() => {
    return [...places]
      .filter((place) => !place.far && momentByDate.has(place.date))
      .sort((a, b) => momentByDate.get(a.date).index - momentByDate.get(b.date).index)
      .map((place) => `${place.x * 4},${place.y * 3}`)
      .join(' ')
  }, [places, momentByDate])

  const selected = places.find((place) => place.name === selectedName) || places[0]
  const selectedMoment = selected ? momentByDate.get(selected.date)?.moment : null

  if (!places.length) return null

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 18, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.3 }}
      transition={reduceMotion ? { duration: 0 } : gentle}
      className="mt-14"
      aria-labelledby="story-map-title"
    >
      <h2 id="story-map-title" className="editorial-label">
        Places we’ve been
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Our little corner of the map — every pin is a day I’d live again. Tap one to revisit it.
      </p>

      <div className="surface relative mt-5 aspect-[4/3] overflow-hidden rounded-xl sm:aspect-[2/1]">
        <svg
          viewBox="0 0 400 300"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {/* Puget Sound */}
          <path
            d="M0,0 L74,0 C64,55 88,105 62,158 C42,200 72,255 56,300 L0,300 Z"
            style={{ fill: 'rgb(var(--sage-rgb) / 0.25)' }}
          />
          {/* Lake Washington */}
          <ellipse cx="206" cy="118" rx="15" ry="64" transform="rotate(7 206 118)" style={{ fill: 'rgb(var(--sage-rgb) / 0.25)' }} />
          {/* Lake Sammamish */}
          <ellipse cx="252" cy="102" rx="8" ry="30" transform="rotate(12 252 102)" style={{ fill: 'rgb(var(--sage-rgb) / 0.25)' }} />
          {/* Our path, in the order we lived it */}
          <polyline
            points={routePoints}
            fill="none"
            style={{ stroke: 'rgb(var(--wine-rgb) / 0.4)' }}
            strokeWidth="1.5"
            strokeDasharray="5 5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <text x="30" y="212" fontSize="9" letterSpacing="2.5" style={{ fill: 'var(--color-muted)' }} opacity="0.7">PUGET SOUND</text>
          <text x="104" y="168" fontSize="9" letterSpacing="2.5" style={{ fill: 'var(--color-muted)' }} opacity="0.7">SEATTLE</text>
          <text x="238" y="66" fontSize="9" letterSpacing="2.5" style={{ fill: 'var(--color-muted)' }} opacity="0.7">REDMOND</text>
          <text x="322" y="118" fontSize="9" letterSpacing="2.5" style={{ fill: 'var(--color-muted)' }} opacity="0.7">SNOQUALMIE</text>
        </svg>

        {places.map((place) => {
          const isSelected = selected && place.name === selected.name
          return (
            <button
              key={place.name}
              type="button"
              onClick={() => setSelectedName(place.name)}
              aria-label={`${place.name}, ${place.area}`}
              aria-pressed={isSelected}
              className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${place.x}%`, top: `${place.y}%` }}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-full shadow-soft ring-1 transition-all ${
                  isSelected
                    ? 'scale-110 bg-wine text-white ring-wine'
                    : place.far
                      ? 'border border-dashed border-wine/50 bg-white/85 text-wine group-hover:bg-white'
                      : 'bg-white text-wine ring-line group-hover:bg-blush/60'
                }`}
              >
                <MapPin size={15} strokeWidth={1.9} aria-hidden="true" />
              </span>
            </button>
          )
        })}
      </div>

      {selected && (
        <div className="surface mt-4 rounded-xl p-5 sm:p-6" aria-live="polite">
          <p className="editorial-label text-wine">{selected.area}</p>
          <h3 className="mt-2 font-display text-2xl leading-tight text-ink">{selected.name}</h3>
          {selectedMoment && (
            <>
              <p className="mt-1 text-sm font-semibold text-muted">
                {selectedMoment.emoji} {selectedMoment.title} · {selectedMoment.date}
              </p>
              {selectedMoment.detail && (
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{selectedMoment.detail}</p>
              )}
              <button type="button" onClick={() => onJump(selected.date)} className="btn-ghost mt-4 text-sm">
                <ArrowDown size={15} aria-hidden="true" />
                Jump to this moment
              </button>
            </>
          )}
          {selected.far && (
            <p className="mt-2 text-sm leading-relaxed text-muted">
              A little far for this map — but it’s where your story turned toward us. 🎓
            </p>
          )}
        </div>
      )}
    </motion.section>
  )
}
