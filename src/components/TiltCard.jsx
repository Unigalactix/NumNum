import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'

// Wraps a card and tilts it toward the cursor for a tactile 3D feel.
// Falls back to a plain motion.div when the user prefers reduced motion.
export default function TiltCard({ children, className, onClick, max = 8, ...rest }) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 200, damping: 20 })
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 200, damping: 20 })

  const onMove = (e) => {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const reset = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 700 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
