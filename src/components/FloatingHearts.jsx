import { useMemo } from 'react'

const EMOJIS = ['💗', '💕', '🌸', '✨', '💖', '🎀', '💘', '🩷']

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Soft floating hearts/petals drifting in the background
export default function FloatingHearts({ count = 10 }) {
  const items = useMemo(
    () =>
      Array.from({ length: prefersReducedMotion ? 0 : count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 6 + Math.random() * 8,
        size: 14 + Math.random() * 26,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        opacity: 0.3 + Math.random() * 0.5,
      })),
    [count],
  )

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {items.map((it) => (
        <span
          key={it.id}
          className="absolute bottom-[-40px] animate-[rise_linear_infinite]"
          style={{
            left: `${it.left}%`,
            fontSize: `${it.size}px`,
            opacity: it.opacity,
            animationDelay: `${it.delay}s`,
            animationDuration: `${it.duration}s`,
          }}
        >
          {it.emoji}
        </span>
      ))}
      <style>{`
        @keyframes rise {
          0%   { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-110vh) rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
