import { useEffect, useRef } from 'react'
import { useStore } from '../store'

// A soft, slow ambient pad synthesised with the Web Audio API — no audio files.
// Plays only while musicOn is true and the app isn't muted.
const CHORD = [261.63, 329.63, 392.0, 493.88] // Cmaj7-ish, very mellow

export function useAmbientMusic() {
  const musicOn = useStore((s) => s.musicOn)
  const muted = useStore((s) => s.muted)
  const ref = useRef(null)

  useEffect(() => {
    const shouldPlay = musicOn && !muted
    if (!shouldPlay) {
      stop(ref)
      return
    }
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    const ac = new AC()
    const master = ac.createGain()
    master.gain.value = 0
    master.connect(ac.destination)
    master.gain.setValueAtTime(0.0001, ac.currentTime)
    master.gain.exponentialRampToValueAtTime(0.06, ac.currentTime + 3)

    const voices = CHORD.map((freq) => {
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      const lfo = ac.createOscillator()
      const lfoGain = ac.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.value = 0.25
      lfo.frequency.value = 0.08 + Math.random() * 0.05 // slow shimmer
      lfoGain.gain.value = 0.12
      lfo.connect(lfoGain).connect(gain.gain)
      osc.connect(gain).connect(master)
      osc.start()
      lfo.start()
      return { osc, lfo }
    })

    ref.current = { ac, master, voices }
    return () => stop(ref)
  }, [musicOn, muted])

  useEffect(() => () => stop(ref), [])
}

function stop(ref) {
  const node = ref.current
  if (!node) return
  ref.current = null
  const { ac, master, voices } = node
  try {
    master.gain.cancelScheduledValues(ac.currentTime)
    master.gain.setValueAtTime(master.gain.value, ac.currentTime)
    master.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 1.2)
    voices.forEach(({ osc, lfo }) => {
      osc.stop(ac.currentTime + 1.3)
      lfo.stop(ac.currentTime + 1.3)
    })
    setTimeout(() => ac.close().catch(() => {}), 1500)
  } catch {
    /* ignore audio teardown errors */
  }
}
