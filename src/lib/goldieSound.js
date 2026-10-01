// An original, synthesized two-part woof, played only from an explicit tap.
export async function playGoldieBark() {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) throw new Error('This browser does not support in-page audio.')
  const context = new AudioContext()
  try {
    await context.resume()
    if (context.state !== 'running') throw new Error('Audio is blocked. Try tapping Woof again.')
    const start = context.currentTime
    for (const delay of [0, 0.28]) {
      const oscillator = context.createOscillator()
      const filter = context.createBiquadFilter()
      const gain = context.createGain()
      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(185, start + delay)
      oscillator.frequency.exponentialRampToValueAtTime(78, start + delay + 0.18)
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(850, start + delay)
      filter.frequency.exponentialRampToValueAtTime(390, start + delay + 0.18)
      filter.Q.value = 0.7
      gain.gain.setValueAtTime(0, start + delay)
      gain.gain.linearRampToValueAtTime(0.16, start + delay + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, start + delay + 0.2)
      oscillator.connect(filter)
      filter.connect(gain)
      gain.connect(context.destination)
      oscillator.start(start + delay)
      oscillator.stop(start + delay + 0.22)
    }
    await new Promise((resolve) => setTimeout(resolve, 600))
  } finally {
    await context.close()
  }
}
