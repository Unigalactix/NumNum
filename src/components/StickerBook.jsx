import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { content } from '../content'
import { useSound } from '../hooks/useSound'
import { spring } from '../lib/motion'

const pageUrl = (file) => `${import.meta.env.BASE_URL}${file}`

export default function StickerBook({ onClose }) {
  const play = useSound()
  const pages = content.stickerPages || []
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [failed, setFailed] = useState({})

  const page = pages[index]
  const total = pages.length

  const go = (next) => {
    const target = (next + total) % total
    if (target === index) return
    play('flip')
    setDir(next > index ? 1 : -1)
    setIndex(target)
  }

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-16">
      <button
        onClick={() => {
          play('click')
          onClose()
        }}
        className="btn-ghost mb-6"
      >
        ← back
      </button>

      <div className="text-center">
        <h2 className="gradient-text font-script text-4xl sm:text-5xl">Our Sticker Book</h2>
        <p className="mt-2 text-[#7a5570]">
          flip through every page of our silly little moments 💗
        </p>
      </div>

      {total === 0 ? (
        <p className="mt-10 text-center text-[#7a5570]">Add sticker sheets to get started.</p>
      ) : (
        <>
          <div className="mt-8 flex items-center justify-center gap-3 sm:gap-5">
            <NavButton dir="prev" onClick={() => go(index - 1)} />

            <div className="relative flex-1" style={{ maxWidth: 560 }}>
              <div className="glass overflow-hidden rounded-[2rem] p-4 shadow-soft">
                <div className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-3xl bg-white">
                  <AnimatePresence mode="popLayout" custom={dir}>
                    <motion.div
                      key={index}
                      custom={dir}
                      initial={{ opacity: 0, x: dir >= 0 ? 60 : -60, rotate: dir >= 0 ? 4 : -4 }}
                      animate={{ opacity: 1, x: 0, rotate: 0 }}
                      exit={{ opacity: 0, x: dir >= 0 ? -60 : 60, rotate: dir >= 0 ? -4 : 4 }}
                      transition={spring}
                      className="absolute inset-0 grid place-items-center p-3"
                    >
                      {failed[index] ? (
                        <div className="text-center">
                          <div className="text-6xl">🩹</div>
                          <p className="mt-2 text-sm font-semibold text-rose/70">
                            couldn’t load this page
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            play('pop')
                            setZoom(true)
                          }}
                          className="h-full w-full"
                          aria-label="Zoom this page"
                        >
                          <img
                            src={pageUrl(page.file)}
                            alt={page.title}
                            loading="eager"
                            onError={() => setFailed((f) => ({ ...f, [index]: true }))}
                            className="h-full w-full object-contain"
                          />
                        </button>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <NavButton dir="next" onClick={() => go(index + 1)} />
          </div>

          <div className="mt-5 text-center">
            <h3 className="font-script text-2xl text-[#6b4560]">{page.title}</h3>
            <p className="text-sm text-[#7a5570]">{page.caption}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-rose/60">
              page {index + 1} of {total}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {pages.map((p, i) => (
              <button
                key={p.file}
                onClick={() => {
                  play('flip')
                  setDir(i > index ? 1 : -1)
                  setIndex(i)
                }}
                aria-label={`Go to ${p.title}`}
                className={`h-2.5 rounded-full transition-all ${
                  i === index ? 'w-6 bg-rose' : 'w-2.5 bg-white/70 hover:bg-rose/40'
                }`}
              />
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {zoom && page && !failed[index] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoom(false)}
            className="fixed inset-0 z-50 grid place-items-center bg-rose/30 p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
              transition={spring}
              className="flex flex-col items-center gap-4"
            >
              <img
                src={pageUrl(page.file)}
                alt={page.title}
                className="max-h-[75vh] max-w-[85vw] rounded-3xl bg-white p-3 shadow-2xl"
              />
              <p className="font-script text-2xl text-white drop-shadow">{page.title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NavButton({ dir, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.08 }}
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Previous page' : 'Next page'}
      className="grid h-12 w-12 shrink-0 place-items-center rounded-full glass text-xl text-rose shadow-soft"
    >
      {dir === 'prev' ? '‹' : '›'}
    </motion.button>
  )
}
