// One shared motion vocabulary so every transition feels like the same system.
export const spring = { type: 'spring', stiffness: 260, damping: 24 }
export const softSpring = { type: 'spring', stiffness: 120, damping: 18 }
export const gentle = { duration: 0.5, ease: [0.22, 1, 0.36, 1] }

// Quiet page transition: enough movement to orient without turning navigation into decoration.
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
}

// Tactile press used on buttons and cards.
export const tap = { scale: 0.97 }
