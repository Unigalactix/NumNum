import { useEffect, useMemo, useRef, useState } from 'react'
import { content } from '../content'
import { useSound } from '../hooks/useSound'

// Pick a hidden message based on WHEN she opens the card (time of day + weekend).
function pickSecret(secrets) {
  if (!secrets) return null
  const now = new Date()
  const h = now.getHours()
  const day = now.getDay() // 0 Sun … 6 Sat
  const isWeekend = day === 0 || day === 6
  const slot =
    h < 5 ? 'night' : h < 12 ? 'morning' : h < 17 ? 'afternoon' : h < 21 ? 'evening' : 'night'
  // On weekends, show a weekend note about half the time; otherwise it's time-of-day.
  const key = isWeekend && secrets.weekend?.length && Math.random() < 0.5 ? 'weekend' : slot
  const list = secrets[key]?.length ? secrets[key] : secrets.default
  return list?.length ? list[Math.floor(Math.random() * list.length)] : null
}

// Canvas scratch-to-reveal card
export default function ScratchCard({ onComplete }) {
  const canvasRef = useRef(null)
  const play = useSound()
  const [revealed, setRevealed] = useState(false)
  const drawing = useRef(false)
  const scratchedOnce = useRef(false)
  const lastCheck = useRef(0)
  // Chosen once per open so the reveal stays stable while she scratches.
  const note = useMemo(() => pickSecret(content.secrets) || content.notes.scratch, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const { width, height } = canvas

    // paint the foil overlay
    const grad = ctx.createLinearGradient(0, 0, width, height)
    grad.addColorStop(0, '#ffb3d1')
    grad.addColorStop(0.5, '#c9a0ff')
    grad.addColorStop(1, '#ffd6a5')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = 'bold 22px Quicksand, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('✨ scratch me ✨', width / 2, height / 2)
    ctx.globalCompositeOperation = 'destination-out'
  }, [])

  const pos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const point = e.touches ? e.touches[0] : e
    return {
      x: ((point.clientX - rect.left) / rect.width) * canvas.width,
      y: ((point.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  const scratch = (e) => {
    if (!drawing.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const { x, y } = pos(e)
    ctx.beginPath()
    ctx.arc(x, y, 26, 0, Math.PI * 2)
    ctx.fill()
    if (!scratchedOnce.current) {
      scratchedOnce.current = true
      play('flip')
    }
    // sampling the whole buffer is costly — do it at most ~7x/sec
    const now = performance.now()
    if (now - lastCheck.current > 150) {
      lastCheck.current = now
      checkCleared()
    }
  }

  const checkCleared = () => {
    if (revealed) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let clear = 0
    for (let i = 3; i < data.length; i += 40) {
      if (data[i] === 0) clear++
    }
    const ratio = clear / (data.length / 40)
    if (ratio > 0.55) {
      setRevealed(true)
      play('win')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setTimeout(() => onComplete(), 900)
    }
  }

  return (
    <div className="text-center">
      <h2 className="gradient-text font-script text-3xl">A Secret For You</h2>
      <p className="mt-1 text-[#7a5570]">Scratch the card to reveal a hidden message ✨</p>

      <div className="relative mx-auto mt-6 h-56 w-full max-w-sm overflow-hidden rounded-3xl shadow-soft">
        <div className="absolute inset-0 grid place-items-center bg-white/90 p-6">
          <div>
            <p className="font-script text-2xl text-rose">{note.title}</p>
            <p className="mt-2 text-[#6b4560]">{note.body}</p>
          </div>
        </div>
        {!revealed && (
          <canvas
            ref={canvasRef}
            width={360}
            height={224}
            className="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing"
            onMouseDown={() => (drawing.current = true)}
            onMouseUp={() => (drawing.current = false)}
            onMouseLeave={() => (drawing.current = false)}
            onMouseMove={scratch}
            onTouchStart={() => (drawing.current = true)}
            onTouchEnd={() => (drawing.current = false)}
            onTouchMove={scratch}
          />
        )}
      </div>
    </div>
  )
}
