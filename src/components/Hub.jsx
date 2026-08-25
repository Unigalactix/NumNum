import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Box,
  Brain,
  Candy,
  Check,
  ChevronDown,
  CircleDot,
  Crosshair,
  Grid2X2,
  Grid3X3,
  Heart,
  KeyRound,
  ListChecks,
  MailOpen,
  Palette,
  Puzzle,
  Route,
  Search,
  Sparkles,
  Target,
} from 'lucide-react'
import { content } from '../content'
import { DAILY_GAME_COUNT, useStore } from '../store'
import { useSound } from '../hooks/useSound'
import { gentle, tap } from '../lib/motion'
import MorningLoveNotes from './MorningLoveNotes'

const GAMES = [
  { id: 'memory', icon: Brain, title: 'Memory of Us', desc: 'Match every pair' },
  { id: 'quiz', icon: ListChecks, title: 'How Well You Know Us', desc: 'A little quiz' },
  { id: 'scratch', icon: Sparkles, title: 'A Secret For You', desc: 'Scratch to reveal' },
  { id: 'pinpoint', icon: Target, title: 'Pinpoint Us', desc: 'Guess from five clues' },
  { id: 'tango', icon: Grid3X3, title: 'Hearts & Stars', desc: 'Fill the logic grid' },
]

const BONUS = [
  { id: 'puzzle', icon: Puzzle, title: 'Piece Us Together', desc: 'Solve the picture' },
  { id: 'lovemeter', icon: Heart, title: 'The Love Meter', desc: 'See how much' },
  { id: 'sudoku', icon: Grid2X2, title: 'Mini Sudoku', desc: 'One through six' },
  { id: 'zip', icon: Route, title: 'Zip', desc: 'Trace one perfect path' },
  { id: 'wend', icon: Search, title: 'Wend', desc: 'Find the hidden words' },
  { id: 'patches', icon: Palette, title: 'Patches', desc: 'Color every region' },
  { id: 'arrowtrail', icon: CircleDot, title: 'Arrow Trail', desc: 'Turn every arrow' },
  { id: 'sweetmatch', icon: Candy, title: 'Sweet Match', desc: 'Match the treats' },
  { id: 'pocketblocks', icon: Box, title: 'Pocket Blocks', desc: 'Clear three lines' },
  { id: 'duckhunt', icon: Crosshair, title: 'Mini Duck Hunt', desc: 'Catch ten targets' },
]

const ALL_GAMES = [...GAMES, ...BONUS]
const GAME_BY_ID = Object.fromEntries(ALL_GAMES.map((game) => [game.id, game]))

function GameGrid({ games, completed, required = false, onOpenGame, play }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {games.map((game, index) => {
        const isDone = !!completed[game.id]
        const Icon = game.icon
        return (
          <motion.button
            key={game.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
            whileHover={{ y: -3 }}
            whileTap={tap}
            onClick={() => {
              play('click')
              onOpenGame(game.id)
            }}
            className={`surface group relative min-h-44 w-full rounded-xl p-5 text-left transition-colors hover:border-wine/35 ${
              required ? 'border-wine/25' : ''
            }`}
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-blush/65 text-wine transition-colors group-hover:bg-wine group-hover:text-white">
              <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <h3 className="mt-7 font-display text-xl leading-tight text-ink">{game.title}</h3>
            <p className="mt-1 text-sm text-muted">{game.desc}</p>
            <span className={`absolute right-4 top-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase ${
              isDone ? 'text-sage' : required ? 'text-wine' : 'text-muted'
            }`} style={{ letterSpacing: '0.08em' }}>
              {isDone ? <Check size={13} /> : required ? <KeyRound size={13} /> : null}
              {isDone ? 'done' : required ? 'required' : 'play'}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

export default function Hub({
  onOpenGame,
  onOpenFinale,
}) {
  const play = useSound()
  const [lockHint, setLockHint] = useState(false)
  const [otherGamesOpen, setOtherGamesOpen] = useState(false)
  const completed = useStore((s) => s.completed)
  const challengeIds = useStore((s) => s.challengeIds)
  const requiredGames = challengeIds.map((id) => GAME_BY_ID[id]).filter(Boolean)
  const requiredIds = new Set(challengeIds)
  const otherGames = ALL_GAMES.filter((game) => !requiredIds.has(game.id))
  const doneCount = challengeIds.filter((id) => completed[id]).length
  const allDone = doneCount === DAILY_GAME_COUNT
  // The Love Letter opens when it's awaiting a new letter, or once all games are done.
  const finaleReady = allDone || !!content.finale.awaiting

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-7 border-b border-[#e4dde0] pb-10 md:grid-cols-[1fr_auto] md:items-end"
      >
        <div>
          <p className="editorial-label">Our private archive</p>
          <h1 className="mt-3 max-w-2xl font-display text-5xl leading-[0.98] text-ink sm:text-6xl">
            A little world, kept for us.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            {content.site.tagline}
          </p>
        </div>
        <div className="min-w-60">
          <div className="flex items-center justify-between text-sm font-semibold text-ink">
            <span>Today’s progress</span>
            <span>{doneCount} of {DAILY_GAME_COUNT}</span>
          </div>
          <div className="mt-3 flex gap-2" aria-label={`${doneCount} of ${DAILY_GAME_COUNT} games complete`}>
            {challengeIds.map((id) => (
              <motion.span
                key={id}
                animate={{ scale: completed[id] ? [1, 1.08, 1] : 1 }}
                className={`h-1.5 flex-1 rounded-full ${completed[id] ? 'bg-wine' : 'bg-[#ddd5d8]'}`}
              />
            ))}
          </div>
        </div>
      </motion.header>

      <MorningLoveNotes />

      <motion.button
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={finaleReady ? { y: -4 } : {}}
        whileTap={tap}
        onClick={() => {
          if (!finaleReady) {
            play('error')
            setLockHint(true)
            setTimeout(() => setLockHint(false), 2200)
            return
          }
          play('unlock')
          onOpenFinale()
        }}
        className={`relative mt-10 grid w-full overflow-hidden rounded-2xl border p-6 text-left transition-colors sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6 sm:p-8 ${
          finaleReady ? 'border-wine/25 bg-[#f6e9ed]' : 'surface'
        }`}
      >
        <span className={`grid h-12 w-12 place-items-center rounded-xl ${finaleReady ? 'bg-wine text-white' : 'bg-lavender text-muted'}`}>
          {finaleReady ? <MailOpen size={23} /> : <KeyRound size={23} />}
        </span>
        <span className="mt-5 block sm:mt-0">
          <span className="editorial-label">Featured letter</span>
          <span className="mt-1 block font-display text-3xl text-ink">The Love Letter</span>
          <span className="mt-1 block text-sm text-muted">
            {finaleReady
              ? content.finale.awaiting
                ? 'The box is open while the next letter is being written.'
                : 'Your new letter is ready.'
              : `Complete today’s five games to unlock it. ${doneCount} of ${DAILY_GAME_COUNT} complete.`}
          </span>
        </span>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-wine sm:mt-0">
          {finaleReady ? 'Open letter' : 'Keep playing'}
          <span aria-hidden="true">→</span>
        </span>
      </motion.button>

      <section className="mt-8" aria-labelledby="required-games-title">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="editorial-label">Daily collection</p>
            <h2 id="required-games-title" className="mt-1 font-display text-3xl text-ink sm:text-4xl">
              Today’s five
            </h2>
          </div>
          <p className="text-sm text-muted">A fresh selection, renewed every day.</p>
        </div>
        <GameGrid
          games={requiredGames}
          completed={completed}
          required
          onOpenGame={onOpenGame}
          play={play}
        />
      </section>

      <section className="mt-10" aria-labelledby="other-games-title">
        <motion.button
          whileTap={tap}
          onClick={() => {
            play('click')
            setOtherGamesOpen((open) => !open)
          }}
          className="surface flex w-full items-center justify-between rounded-xl px-5 py-4 text-left sm:px-6"
          aria-expanded={otherGamesOpen}
          aria-controls="other-games-panel"
        >
          <span>
            <span id="other-games-title" className="block font-display text-xl text-ink">
              The full collection
            </span>
            <span className="mt-0.5 block text-sm text-muted">
              {otherGames.length} more games to revisit anytime
            </span>
          </span>
          <motion.span
            animate={{ rotate: otherGamesOpen ? 180 : 0 }}
            transition={gentle}
            className="ml-4 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#e4dde0] bg-white text-wine"
            aria-hidden="true"
          >
            <ChevronDown size={18} />
          </motion.span>
        </motion.button>

        <AnimatePresence initial={false}>
          {otherGamesOpen && (
            <motion.div
              id="other-games-panel"
              key="other-games"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={gentle}
              className="overflow-hidden"
            >
              <div className="pt-5">
                <GameGrid
                  games={otherGames}
                  completed={completed}
                  onOpenGame={onOpenGame}
                  play={play}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <AnimatePresence>
        {lockHint && (
          <motion.div
            key="lockhint"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass fixed bottom-16 left-1/2 z-40 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-semibold text-[#6b4560] shadow-soft"
          >
            Finish today’s 5 required games to unlock the letter 💗
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
