import { useEffect, useRef, useState } from 'react'
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
  const [loaded, setLoaded] = useState({})
  const zoomRef = useRef(null)

  const page = pages[index]
  const total = pages.length

  useEffect(() => {
    if (!zoom) return
    zoomRef.current?.focus()
  }, [zoom])

  const go = (next) => {
    if (total < 2) return
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
          <div className="glass relative mx-auto mt-8 max-w-[38rem] rounded-[2rem] p-2.5 shadow-soft sm:p-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-[#fffafc] shadow-inner sm:rounded-3xl">
              <AnimatePresence mode="popLayout" custom={dir}>
                <motion.div
                  key={index}
                  custom={dir}
                  initial={{ opacity: 0, x: dir >= 0 ? 60 : -60, rotate: dir >= 0 ? 2 : -2 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, x: dir >= 0 ? -60 : 60, rotate: dir >= 0 ? -2 : 2 }}
                  transition={spring}
                  className="absolute inset-0 grid place-items-center p-2 sm:p-4"
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
                      className="relative h-full w-full cursor-zoom-in"
                      aria-label={`Zoom ${page.title}`}
                    >
                      {!loaded[index] && <span className="skeleton absolute inset-0 rounded-2xl" />}
                      <img
                        src={pageUrl(page.file)}
                        alt={page.title}
                        loading="eager"
                        onLoad={() => setLoaded((state) => ({ ...state, [index]: true }))}
                        onError={() => setFailed((state) => ({ ...state, [index]: true }))}
                        className={`h-full w-full object-contain transition-opacity duration-300 ${
                          loaded[index] ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>

              <NavButton dir="prev" onClick={() => go(index - 1)} disabled={total < 2} />
              <NavButton dir="next" onClick={() => go(index + 1)} disabled={total < 2} />
            </div>
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
                  if (i === index) return
                  play('flip')
                  setDir(i > index ? 1 : -1)
                  setIndex(i)
                }}
                aria-label={`Go to ${p.title}`}
                aria-current={i === index ? 'page' : undefined}
                title={p.title}
                className={`h-2.5 rounded-full transition-all ${
                  i === index ? 'w-6 bg-rose' : 'w-2.5 bg-white/70 hover:bg-rose/40'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {zoom && page && !failed[index] && (
        <div
          ref={zoomRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${page.title} enlarged`}
          tabIndex={-1}
          onClick={() => setZoom(false)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setZoom(false)
          }}
          className="fixed inset-0 z-50 grid place-items-center bg-rose/30 p-4 outline-none backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={spring}
            onClick={(event) => event.stopPropagation()}
            className="glass relative flex max-h-[90vh] w-full max-w-2xl flex-col items-center gap-4 rounded-3xl p-5 shadow-soft sm:p-8"
          >
            <button
              onClick={() => setZoom(false)}
              aria-label="Close enlarged sticker page"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/80 text-xl text-rose shadow-soft transition hover:scale-110"
            >
              ×
            </button>
            <img
              src={pageUrl(page.file)}
              alt={page.title}
              className="max-h-[68vh] max-w-full rounded-2xl bg-white object-contain shadow-soft"
            />
            <h3 className="font-script text-2xl text-[#6b4560]">{page.title}</h3>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function NavButton({ dir, onClick, disabled }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.08 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'prev' ? 'Previous page' : 'Next page'}
      className={`glass absolute top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-2xl text-rose shadow-soft disabled:hidden sm:h-12 sm:w-12 ${
        dir === 'prev' ? 'left-2 sm:left-3' : 'right-2 sm:right-3'
      }`}
    >
      {dir === 'prev' ? '‹' : '›'}
    </motion.button>
  )
}
