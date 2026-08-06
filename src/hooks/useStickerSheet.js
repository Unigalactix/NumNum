import { useEffect, useMemo, useState } from 'react'
import { content } from '../content'
import { sheetUrlFor } from '../lib/sprite'

// Load the sticker sprite sheet once and report whether it's ready.
// Shared by App, MemoryMatch and StickerBook so the image is fetched a single time.
export function useStickerSheet() {
  const sheet = content.stickerSheet
  const sheetUrl = useMemo(() => sheetUrlFor(sheet), [sheet])
  const [sheetOk, setSheetOk] = useState(false)

  useEffect(() => {
    if (!sheetUrl) return
    const img = new Image()
    img.onload = () => setSheetOk(true)
    img.onerror = () => setSheetOk(false)
    img.src = sheetUrl
  }, [sheetUrl])

  return { sheet, sheetUrl, sheetOk }
}
