import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  CalendarHeart,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react'
import { content } from '../content'
import { useSound } from '../hooks/useSound'
import { gentle, pageTransition, tap } from '../lib/motion'
import Modal from './Modal'

const DAY_MS = 24 * 60 * 60 * 1000

function daysSince(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  const today = new Date()
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const eventUtc = Date.UTC(year, month - 1, day)
  return Math.max(0, Math.floor((todayUtc - eventUtc) / DAY_MS))
}

export default function HistoryOfUs({ onClose }) {
  const play = useSound()
  const reduceMotion = useReducedMotion()
  const moments = content.history || []
  const favorites = content.favorites || []
  const [selectedImage, setSelectedImage] = useState(null)
  const [photoIndex, setPhotoIndex] = useState(0)
  const photoCount = selectedImage
    ? (selectedImage.images || [selectedImage]).length
    : 0

  useEffect(() => {
    if (!selectedImage || photoCount <= 1 || reduceMotion) return undefined
    const timer = setInterval(() => {
      setPhotoIndex((index) => (index + 1) % photoCount)
    }, 3500)
    return () => clearInterval(timer)
  }, [selectedImage, photoCount, photoIndex, reduceMotion])

  return (
    <div className="mx-auto max-w-5xl overflow-x-hidden px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
      <motion.button
        whileTap={tap}
        onClick={() => {
          play('click')
          onClose()
        }}
        className="icon-button mb-8"
        aria-label="Back to home"
        title="Back to home"
      >
        <ArrowLeft size={19} aria-hidden="true" />
      </motion.button>

      <motion.header {...pageTransition} className="max-w-3xl">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-blush/70 text-wine">
          <CalendarHeart size={21} strokeWidth={1.7} aria-hidden="true" />
        </span>
        <p className="editorial-label mt-7">Our chronology</p>
        <h1 className="mt-2 font-display text-5xl leading-none text-ink sm:text-6xl">History of Us</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
          The dates we return to, and all the little moments that made them ours.
        </p>
      </motion.header>

      {favorites.length > 0 && (
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 18, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.5 }}
          transition={reduceMotion ? { duration: 0 } : gentle}
          className="mt-10 border-y border-[#e4dde0] py-6"
          aria-labelledby="favorite-things-title"
        >
          <h2 id="favorite-things-title" className="editorial-label">
            Num Num’s favorite things
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {favorites.map((favorite) => (
              <div
                key={favorite.label}
                className="flex items-center gap-3 text-sm font-semibold text-ink"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-lg shadow-soft" aria-hidden="true">{favorite.emoji}</span>
                {favorite.label}
              </div>
            ))}
          </div>
        </motion.section>
      )}

      <div className="relative mx-auto mt-14 max-w-4xl">
        <div className="absolute bottom-5 left-[1.15rem] top-5 w-px bg-[#d8ced2] sm:left-1/2 sm:-translate-x-1/2" />

        <div className="space-y-6">
          {moments.map((moment, index) => {
            const right = index % 2 === 1
            return (
              <motion.article
                key={`${moment.date}-${moment.title}`}
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        x: right ? 36 : -36,
                        y: 20,
                        scale: 0.96,
                        filter: 'blur(7px)',
                      }
                }
                whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.35 }}
                transition={reduceMotion ? { duration: 0 } : gentle}
                className={`relative grid items-center pl-14 sm:grid-cols-2 sm:pl-0 ${
                  right ? 'sm:[&>div]:col-start-2 sm:[&>div]:ml-8' : 'sm:[&>div]:mr-8'
                }`}
              >
                <div className="surface rounded-xl p-5 text-left sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blush/55 text-lg">{moment.emoji}</span>
                    <div>
                      <p className="editorial-label text-wine">
                        {moment.date}
                      </p>
                      <h3 className="mt-2 font-display text-xl leading-tight text-ink">{moment.title}</h3>
                      {moment.detail && (
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          {moment.detail}
                        </p>
                      )}
                      {moment.since && (
                        <p className="mt-4 border-l-2 border-wine/35 pl-3 text-xs font-semibold text-wine">
                          {daysSince(moment.since)} days {moment.countLabel}
                        </p>
                      )}
                      {(moment.image || moment.images?.length > 0) && (
                        <button
                          type="button"
                          onClick={() => {
                            play('click')
                            setPhotoIndex(0)
                            setSelectedImage(moment)
                          }}
                          className="btn-ghost mt-4 text-sm"
                        >
                          <ImageIcon size={16} aria-hidden="true" />
                          {moment.imageLabel || 'View photo'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <motion.span
                  initial={reduceMotion ? false : { scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 18 }}
                  className="absolute left-[0.82rem] top-1/2 grid h-3 w-3 -translate-y-1/2 place-items-center rounded-full bg-wine ring-4 ring-porcelain sm:left-1/2 sm:-translate-x-1/2"
                />
              </motion.article>
            )
          })}
        </div>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={reduceMotion ? { duration: 0 } : gentle}
        className="mt-14 text-center font-display text-3xl italic text-wine"
      >
        And we’re only getting started.
      </motion.div>

      <Modal open={!!selectedImage} onClose={() => setSelectedImage(null)} wide>
        {selectedImage && (
          <div>
            <p className="editorial-label pr-12 text-wine">{selectedImage.date}</p>
            <h2 className="mt-2 pr-12 font-display text-3xl leading-tight text-ink">
              {selectedImage.title}
            </h2>
            {(() => {
              const photos = selectedImage.images || [selectedImage]
              if (photos.length <= 1) {
                const [photo] = photos
                return (
                  <img
                    key={photo.image}
                    src={`${import.meta.env.BASE_URL}${photo.image}`}
                    alt={photo.imageAlt || ''}
                    className="mt-5 max-h-[72vh] w-full rounded-lg object-contain"
                  />
                )
              }
              const activeIndex = Math.min(photoIndex, photos.length - 1)
              const photo = photos[activeIndex]
              const goTo = (index) => {
                play('click')
                setPhotoIndex(
                  ((index % photos.length) + photos.length) % photos.length,
                )
              }
              return (
                <div>
                  <div className="relative mt-5 overflow-hidden rounded-lg">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.img
                        key={photo.image}
                        src={`${import.meta.env.BASE_URL}${photo.image}`}
                        alt={photo.imageAlt || ''}
                        initial={
                          reduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, x: 48 }
                        }
                        animate={{ opacity: 1, x: 0 }}
                        exit={
                          reduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, x: -48 }
                        }
                        transition={{
                          duration: reduceMotion ? 0.15 : 0.35,
                          ease: 'easeOut',
                        }}
                        className="max-h-[62vh] w-full rounded-lg object-contain"
                      />
                    </AnimatePresence>
                    <button
                      type="button"
                      onClick={() => goTo(activeIndex - 1)}
                      aria-label="Previous photo"
                      className="icon-button absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 shadow-soft"
                    >
                      <ChevronLeft size={19} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => goTo(activeIndex + 1)}
                      aria-label="Next photo"
                      className="icon-button absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 shadow-soft"
                    >
                      <ChevronRight size={19} aria-hidden="true" />
                    </button>
                    <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">
                      {activeIndex + 1} / {photos.length}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-center gap-2">
                    {photos.map((dotPhoto, index) => (
                      <button
                        key={dotPhoto.image}
                        type="button"
                        onClick={() => goTo(index)}
                        aria-label={`Show photo ${index + 1}`}
                        className={`h-2.5 rounded-full transition-all ${
                          index === activeIndex
                            ? 'w-6 bg-wine'
                            : 'w-2.5 bg-wine/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </Modal>
    </div>
  )
}