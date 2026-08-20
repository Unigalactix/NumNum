import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const DAY_MS = 24 * 60 * 60 * 1000
export const DAILY_GAME_COUNT = 5

export const ALL_GAME_IDS = [
  'memory',
  'quiz',
  'scratch',
  'pinpoint',
  'tango',
  'puzzle',
  'lovemeter',
  'sudoku',
  'zip',
  'wend',
  'patches',
  'arrowtrail',
  'sweetmatch',
  'pocketblocks',
  'duckhunt',
]

function pickDailyGames(previous = []) {
  let selected = []

  for (let attempt = 0; attempt < 5; attempt++) {
    const shuffled = [...ALL_GAME_IDS]
    for (let index = shuffled.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1))
      ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
    }
    selected = shuffled.slice(0, DAILY_GAME_COUNT)
    if (selected.some((id) => !previous.includes(id))) break
  }

  return selected
}

export const useStore = create(
  persist(
    (set, get) => ({
      entered: false, // passed the riddle gate
      view: 'hub', // 'hub' | gameId | 'finale' | section — persisted so refresh keeps your place
      completed: {}, // { [gameId]: true }
      finaleSeen: false,
      challengeIds: pickDailyGames(),
      cycleStartedAt: Date.now(),
      letterVersion: null,

      enter: () => set({ entered: true }),
      setView: (view) => set({ view }),
      completeGame: (id) =>
        set((s) => ({ completed: { ...s.completed, [id]: true } })),
      markFinaleSeen: () => set({ finaleSeen: true }),

      allDone: () => get().challengeIds.every((id) => get().completed[id]),
      doneCount: () => get().challengeIds.filter((id) => get().completed[id]).length,

      syncCycle: (letterVersion, now = Date.now()) =>
        set((state) => {
          const validChallenge =
            state.challengeIds?.length === DAILY_GAME_COUNT &&
            new Set(state.challengeIds).size === DAILY_GAME_COUNT &&
            state.challengeIds.every((id) => ALL_GAME_IDS.includes(id))
          const expired = now - state.cycleStartedAt >= DAY_MS
          const newLetter = state.letterVersion !== letterVersion

          if (validChallenge && !expired && !newLetter) return state

          return {
            entered: false,
            view: 'hub',
            completed: {},
            finaleSeen: false,
            challengeIds: pickDailyGames(state.challengeIds),
            cycleStartedAt: now,
            letterVersion,
          }
        }),

      reset: () =>
        set((state) => ({
          entered: false,
          view: 'hub',
          completed: {},
          finaleSeen: false,
          challengeIds: pickDailyGames(state.challengeIds),
          cycleStartedAt: Date.now(),
        })),
    }),
    { name: 'numnum-progress-v1' },
  ),
)
