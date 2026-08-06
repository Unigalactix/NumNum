import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// The 5 mini-games that must be completed to unlock the finale letter
export const GAME_IDS = ['memory', 'quiz', 'scratch', 'puzzle', 'lovemeter']

export const useStore = create(
  persist(
    (set, get) => ({
      entered: false, // passed the riddle gate
      completed: {}, // { [gameId]: true }
      muted: false,
      finaleSeen: false,

      enter: () => set({ entered: true }),
      completeGame: (id) =>
        set((s) => ({ completed: { ...s.completed, [id]: true } })),
      toggleMute: () => set((s) => ({ muted: !s.muted })),
      markFinaleSeen: () => set({ finaleSeen: true }),

      allDone: () => GAME_IDS.every((id) => get().completed[id]),
      doneCount: () => GAME_IDS.filter((id) => get().completed[id]).length,

      reset: () =>
        set({ entered: false, completed: {}, finaleSeen: false }),
    }),
    { name: 'numnum-progress-v1' },
  ),
)
