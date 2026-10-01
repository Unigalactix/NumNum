import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Dog, Play, Tv, Volume2 } from 'lucide-react'
import { noteCollections } from '../loveNotes'
import { playGoldieBark } from '../lib/goldieSound'

function GoldenPuppy() {
  return (
    <svg viewBox="0 0 130 100" className="golden-puppy" aria-hidden="true">
      <path className="puppy-tail" d="M94 68Q124 48 116 32" fill="none" stroke="#dba347" strokeWidth="11" strokeLinecap="round" />
      <ellipse cx="78" cy="70" rx="32" ry="20" fill="#e8b85d" />
      <path d="M60 78v13M88 78v13" stroke="#dba347" strokeWidth="13" strokeLinecap="round" />
      <ellipse cx="47" cy="45" rx="28" ry="29" fill="#f2cc7b" />
      <ellipse cx="24" cy="46" rx="11" ry="24" fill="#cb913e" transform="rotate(15 24 46)" />
      <ellipse cx="70" cy="46" rx="11" ry="24" fill="#cb913e" transform="rotate(-15 70 46)" />
      <circle cx="37" cy="43" r="3" fill="#392b23" />
      <circle cx="57" cy="43" r="3" fill="#392b23" />
      <ellipse cx="47" cy="58" rx="14" ry="11" fill="#ffe6aa" />
      <path d="M42 53q5-5 10 0l-5 5z" fill="#392b23" />
      <path d="M47 58v5m-7-1q7 7 14 0" fill="none" stroke="#392b23" strokeWidth="2" strokeLinecap="round" />
      <path d="M44 67q3 10 6 0" fill="#dc8f91" />
      <path d="M30 73q17 8 32 0" fill="none" stroke="#8f4058" strokeWidth="5" />
      <circle cx="47" cy="78" r="4" fill="#f9e3ac" />
    </svg>
  )
}

export default function LittleCompanion({ kind, animate }) {
  const [reduceMotion, setReduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [expanded, setExpanded] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [messageIndex, setMessageIndex] = useState(-1)
  const [travel, setTravel] = useState(0)
  const [barking, setBarking] = useState(false)
  const [soundError, setSoundError] = useState('')
  const timer = useRef()
  const moving = animate && !reduceMotion
  const isGoldie = kind === 'goldie'
  const notes = noteCollections[isGoldie ? 'goldie' : 'cartoon']

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(media.matches)
    media.addEventListener('change', update)
    document.addEventListener('visibilitychange', update)
    update()
    return () => {
      media.removeEventListener('change', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  useEffect(() => {
    setFetching(false)
    setMessageIndex(-1)
    return () => clearTimeout(timer.current)
  }, [kind])

  useEffect(() => {
    const stop = () => {
      clearTimeout(timer.current)
      setFetching(false)
    }
    const pauseWhenHidden = () => { if (document.hidden) stop() }
    if (!moving) stop()
    window.addEventListener('resize', stop)
    document.addEventListener('visibilitychange', pauseWhenHidden)
    return () => {
      window.removeEventListener('resize', stop)
      document.removeEventListener('visibilitychange', pauseWhenHidden)
    }
  }, [moving])

  const play = () => {
    if (fetching) return
    setMessageIndex((index) => (index + 1) % notes.length)
    if (isGoldie && moving && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTravel(Math.max(0, document.documentElement.clientWidth - 150))
      setFetching(true)
      timer.current = setTimeout(() => setFetching(false), 4400)
    }
  }

  const bark = async () => {
    setBarking(true)
    setSoundError('')
    try {
      await playGoldieBark()
    } catch (error) {
      console.error('Goldie could not play a bark:', error)
      setSoundError('Goldie could not play audio. Check your browser sound permission and try again.')
    } finally {
      setBarking(false)
    }
  }

  return (
    <>
    {isGoldie && fetching && moving && (
      <div className="goldie-runway can-move" aria-hidden="true">
        <motion.div className="goldie-runner" initial={{ x: 0 }} animate={{ x: [0, -travel, -travel, 0] }} transition={{ duration: 4.4, times: [0, 0.44, 0.56, 1], ease: 'easeInOut' }}>
          <motion.div animate={{ scaleX: [1, 1, -1, -1] }} transition={{ duration: 4.4, times: [0, 0.46, 0.54, 1] }}>
            <GoldenPuppy />
          </motion.div>
        </motion.div>
        <motion.span className="runway-ball" initial={{ x: 0, y: 0 }} animate={{ x: [0, -travel, -travel, 0], y: [0, -70, -30, -30] }} transition={{ duration: 4.4, times: [0, 0.25, 0.56, 1], ease: 'easeInOut' }} />
      </div>
    )}
    <aside className={`little-companion ${expanded ? 'is-open' : ''}`} aria-label={isGoldie ? 'Goldie puppy companion' : 'Cartoon corner'}>
      <button type="button" className="companion-toggle" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls="companion-play">
        {isGoldie ? <Dog size={20} aria-hidden="true" /> : <Tv size={20} aria-hidden="true" />}
        <span>{isGoldie ? 'Goldie' : 'Cartoon break'}</span>
        {expanded && <ChevronDown size={16} aria-hidden="true" />}
      </button>
      {expanded && (
        <div id="companion-play" className="companion-play">
          {isGoldie ? (
            <div className={`puppy-yard ${moving ? 'can-move' : ''}`}>
              <div className="puppy-walk" style={{ visibility: fetching ? 'hidden' : 'visible' }}>
                <GoldenPuppy />
              </div>
            </div>
          ) : (
            <div className="cartoon-corner-icon"><Tv size={40} aria-hidden="true" /></div>
          )}
          <p className="companion-message" role="status" aria-live="polite">
            {messageIndex < 0
              ? isGoldie
                ? 'Throw a ball and watch Goldie fetch it across your screen. 🐶🎾'
                : 'A little Shin-chan break? Here are our own silly notes to go with it. 📺💛'
              : notes[messageIndex].body}
          </p>
          <button type="button" className="btn-ghost w-full" onClick={play} disabled={fetching}>
            <Play size={15} aria-hidden="true" />
            {isGoldie ? (fetching ? 'Go, Goldie, go!' : 'Throw the ball') : 'A little nonsense'}
          </button>
          {isGoldie && (
            <>
              <button type="button" className="btn-ghost mt-2 w-full" onClick={bark} disabled={barking}>
                <Volume2 size={16} aria-hidden="true" />{barking ? 'Woof woof!' : 'Hear Goldie woof'}
              </button>
              <p className="mt-2 text-xs leading-relaxed text-muted">Sound plays here only when tapped. Browser push notifications use your device’s sound, not custom barks.</p>
              {soundError && <p role="alert" className="mt-2 text-xs text-wine">{soundError}</p>}
            </>
          )}
        </div>
      )}
    </aside>
    </>
  )
}
