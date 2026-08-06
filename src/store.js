import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// The 5 mini-games that must be completed to unlock the finale letter
export const GAME_IDS = ['memory', 'quiz', 'scratch', 'puzzle', 'lovemeter']

export const useStore = create(
  persist(
    (set, get) => ({
      entered: false, // passed the riddle gate
      view: 'hub', // 'hub' | gameId | 'finale' | 'stickers' — persisted so refresh keeps your place
      completed: {}, // { [gameId]: true }
      muted: false,
      musicOn: false, // soft ambient background pad
      finaleSeen: false,

      enter: () => set({ entered: true }),
      setView: (view) => set({ view }),
      completeGame: (id) =>
        set((s) => ({ completed: { ...s.completed, [id]: true } })),
      toggleMute: () => set((s) => ({ muted: !s.muted })),
      toggleMusic: () => set((s) => ({ musicOn: !s.musicOn })),
      markFinaleSeen: () => set({ finaleSeen: true }),

      allDone: () => GAME_IDS.every((id) => get().completed[id]),
      doneCount: () => GAME_IDS.filter((id) => get().completed[id]).length,

      reset: () =>
        set({ entered: false, view: 'hub', completed: {}, finaleSeen: false }),
    }),
    { name: 'numnum-progress-v1' },
  ),
)
