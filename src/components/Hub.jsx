import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { content } from '../content'
import { DAILY_GAME_COUNT, useStore } from '../store'
import { useSound } from '../hooks/useSound'
import TiltCard from './TiltCard'
import { tap } from '../lib/motion'

const GAMES = [
  { id: 'memory', emoji: '🃏', title: 'Memory of Us', desc: 'Match every pair', hover: 'flip ’em all 💞' },
  { id: 'quiz', emoji: '💭', title: 'How Well You Know Us', desc: 'A little quiz', hover: 'no pressure 😉' },
  { id: 'scratch', emoji: '✨', title: 'A Secret For You', desc: 'Scratch to reveal', hover: 'shhh… 🤫' },
  { id: 'pinpoint', emoji: '🎯', title: 'Pinpoint Us', desc: 'Guess from 5 clues', hover: 'read the clues 💭' },
  { id: 'tango', emoji: '⭐', title: 'Hearts & Stars', desc: 'Fill the logic grid', hover: 'no 3 in a row 💗' },
]

const BONUS = [
  { id: 'puzzle', emoji: '🧩', title: 'Piece Us Together', desc: 'Solve the picture', hover: 'find the pieces 💝' },
  { id: 'lovemeter', emoji: '💗', title: 'The Love Meter', desc: 'How much? find out', hover: 'spoiler: a lot 💕' },
  { id: 'sudoku', emoji: '🔢', title: 'Mini Sudoku', desc: '1–6, no repeats', hover: 'every box counts 💛' },
  { id: 'zip', emoji: '🧵', title: 'Zip', desc: 'One path, 1→ 6', hover: 'trace it all 💞' },
  { id: 'wend', emoji: '🔤', title: 'Wend', desc: 'Trace hidden words', hover: 'find our words 💌' },
  { id: 'patches', emoji: '🎨', title: 'Patches', desc: 'Color the regions', hover: 'no matching neighbors 🌈' },
  { id: 'arrowtrail', emoji: '↪️', title: 'Arrow Trail', desc: 'Turn every arrow', hover: 'find the path to me 💗' },
  { id: 'sweetmatch', emoji: '🍬', title: 'Sweet Match', desc: 'Match the treats', hover: 'three is extra sweet 🍭' },
  { id: 'pocketblocks', emoji: '🧱', title: 'Pocket Blocks', desc: 'Clear three lines', hover: 'make it all fit 💫' },
  { id: 'duckhunt', emoji: '🦆', title: 'Mini Duck Hunt', desc: 'Tap ten flying ducks', hover: 'quick, there goes one! 💨' },
]

const ALL_GAMES = [...GAMES, ...BONUS]

export default function Hub({
  onOpenGame,
  onOpenFinale,
  onOpenStickers,
  onOpenLetters,
  onOpenHistory,
}) {
  const play = useSound()
  const [lockHint, setLockHint] = useState(false)
  const completed = useStore((s) => s.completed)
  const challengeIds = useStore((s) => s.challengeIds)
  const doneCount = challengeIds.filter((id) => completed[id]).length
  const allDone = doneCount === DAILY_GAME_COUNT
  // The Love Letter opens when it's awaiting a new letter, or once all games are done.
  const finaleReady = allDone || !!content.finale.awaiting

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="gradient-text font-script text-5xl sm:text-6xl">
          {content.site.title}
        </h1>
        <p className="mt-2 text-lg text-[#6a4360]">{content.site.tagline}</p>

        {/* progress hearts */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {challengeIds.map((id) => (
            <motion.span
              key={id}
              animate={{ scale: completed[id] ? [1, 1.4, 1] : 1 }}
              className="text-2xl"
            >
              {completed[id] ? '💗' : '🤍'}
            </motion.span>
          ))}
        </div>
        <p className="mt-1 text-sm font-semibold text-rose/70">
          {doneCount} / {DAILY_GAME_COUNT} of today’s games unlocked
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <motion.button
            whileTap={tap}
            onClick={() => {
              play('click')
              onOpenStickers()
            }}
            className="btn"
          >
            📖 Open our Sticker Book
          </motion.button>
          <motion.button
            whileTap={tap}
            onClick={() => {
              play('click')
              onOpenLetters()
            }}
            className="btn-ghost"
          >
            💌 Previous Letters
          </motion.button>
          <motion.button
            whileTap={tap}
            onClick={() => {
              play('click')
              onOpenHistory()
            }}
            className="btn-ghost"
          >
            🗓️ History of Us
          </motion.button>
        </div>
      </motion.header>

      {/* The letter stays above the full game collection. */}
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
        className={`gradient-ring mt-10 w-full overflow-hidden rounded-3xl p-6 text-center sm:p-8 ${
          finaleReady
            ? 'bg-gradient-to-br from-rose to-periwinkle text-white'
            : 'glass'
        }`}
      >
        <div className="text-6xl">{finaleReady ? '💌' : '🔒'}</div>
        <h2 className={`mt-3 text-2xl font-bold ${finaleReady ? 'text-white' : 'text-[#6b4560]'}`}>
          The Love Letter
        </h2>
        <p className={`mx-auto mt-1 max-w-xl text-sm sm:text-base ${finaleReady ? 'text-white/90' : 'text-[#7a5570]'}`}>
          {finaleReady
            ? content.finale.awaiting
              ? 'No new letter yet — peek inside 💌'
              : 'You found all 5 keys. Your new letter is ready to open 💗'
            : 'Complete the 5 games marked 🔑 required below to open your new letter.'}
        </p>
        {!finaleReady && (
          <span className="mt-3 inline-flex rounded-full bg-white/70 px-4 py-1.5 text-xs font-bold text-rose">
            {doneCount} / {DAILY_GAME_COUNT} required games complete
          </span>
        )}
        {finaleReady && (
          <span className="absolute right-5 top-5">
            ✨
          </span>
        )}
      </motion.button>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_GAMES.map((g, i) => {
          const isDone = !!completed[g.id]
          const isRequired = challengeIds.includes(g.id)
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
            >
              <TiltCard
                whileTap={tap}
                onClick={() => {
                  play('click')
                  onOpenGame(g.id)
                }}
                className={`glass group relative block w-full overflow-hidden rounded-3xl p-6 text-left ${
                  isRequired ? 'gradient-ring' : ''
                }`}
              >
                <div className="text-5xl">{g.emoji}</div>
                <h3 className="mt-3 text-xl font-bold text-[#6b4560]">{g.title}</h3>
                <p className="text-sm text-[#7a5570]">
                  <span className="transition-opacity duration-200 group-hover:opacity-0">
                    {g.desc}
                  </span>
                  <span className="absolute left-6 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {g.hover}
                  </span>
                </p>
                <span
                  className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${
                    isDone
                      ? 'bg-mint/60 text-emerald-700'
                      : isRequired
                        ? 'bg-petal/90 text-rose'
                        : 'bg-white/70 text-rose'
                  }`}
                >
                  {isDone ? 'done 💗' : isRequired ? '🔑 required' : 'play'}
                </span>
              </TiltCard>
            </motion.div>
          )
        })}
      </div>

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
