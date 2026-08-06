import { useCallback } from 'react'
import { useStore } from '../store'

// Sound effects synthesised with the Web Audio API — no audio files needed,
// works offline and on GitHub Pages with zero extra assets.
let ctx

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function note(ac, freq, start, dur, type = 'sine', peak = 0.14) {
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t = ac.currentTime + start
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain).connect(ac.destination)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

const SOUNDS = {
  click: (ac) => note(ac, 520, 0, 0.09, 'triangle', 0.1),
  flip: (ac) => note(ac, 380, 0, 0.08, 'sine', 0.08),
  pop: (ac) => {
    note(ac, 660, 0, 0.1, 'triangle')
    note(ac, 990, 0.05, 0.12, 'sine')
  },
  error: (ac) => {
    note(ac, 220, 0, 0.14, 'sawtooth', 0.07)
    note(ac, 180, 0.08, 0.16, 'sawtooth', 0.07)
  },
  unlock: (ac) => {
    ;[523, 659, 784, 1046].forEach((f, i) => note(ac, f, i * 0.09, 0.25, 'sine'))
  },
  win: (ac) => {
    ;[659, 784, 988, 1318, 1568].forEach((f, i) =>
      note(ac, f, i * 0.1, 0.3, 'triangle', 0.12),
    )
  },
}

export function useSound() {
  const muted = useStore((s) => s.muted)
  return useCallback(
    (name) => {
      if (muted) return
      const ac = getCtx()
      if (!ac || !SOUNDS[name]) return
      try {
        SOUNDS[name](ac)
      } catch {
        /* ignore audio errors */
      }
    },
    [muted],
  )
}
