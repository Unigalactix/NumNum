// Turn one sticker sheet into a sprite atlas: returns the CSS to show cell (r, c).
export function spriteCellStyle(sheetUrl, sheet, r, c) {
  const { cols, rows, cellAspectRatio = 1 } = sheet
  return {
    aspectRatio: cellAspectRatio,
    backgroundImage: `url(${sheetUrl})`,
    backgroundSize: `${cols * 100}% ${rows * 100}%`,
    backgroundPosition: `${(c / (cols - 1)) * 100}% ${(r / (rows - 1)) * 100}%`,
    backgroundRepeat: 'no-repeat',
  }
}

export function sheetUrlFor(sheet) {
  return sheet ? `${import.meta.env.BASE_URL}${sheet.file}` : null
}
