// ─────────────────────────────────────────────────────────────
//  💗  ALL YOUR PERSONAL CONTENT LIVES HERE  💗
//  Edit any text below. Drop photos into /public/assets and set
//  the filenames in `photos` to use real pictures in the games.
// ─────────────────────────────────────────────────────────────

export const content = {
  her: { name: 'Neha', nickname: 'Num Num' },

  site: {
    title: 'For My Num Num',
    tagline: 'a tiny universe I built, just for you 💗',
  },

  // The entry gate — she must answer this to open the site
  gate: {
    question: 'Before you come in… answer this. What was our first meal together?',
    answer: 'Din Tai Fung',
    hint: 'Noodles 🍜, string beans 🫛 and Fried rice 🍚.',
    success: 'Yesss — that’s where it all began. Come in, my love… 💕',
  },

  // Photos: drop files into /public/assets and list them here.
  // Leave the array as-is to use cute emoji placeholders instead.
  photos: [
    // 'assets/us-1.jpg',
    // 'assets/us-2.jpg',
  ],

  // The jigsaw puzzle uses this picture. Save the paper-diorama photo as
  // public/assets/diorama.jpg (or set to null to fall back to gradient tiles).
  puzzleImage: 'assets/diorama.jpg',

  // Chibi-sticker "Sticker Book" 💗
  // You provided a single sticker SHEET, so we slice it like a sprite map.
  // Save that sheet as public/assets/stickers/sheet.png (a 3-column × 5-row grid).
  // Each sticker below maps to a cell by row (r) and column (c), 0-indexed.
  // If the sheet is missing, the cute emoji placeholder shows instead.
  stickerSheet: { file: 'assets/stickers/sheet.png', cols: 3, rows: 5 },
  stickers: [
    { r: 0, c: 0, emoji: '🤗', caption: 'Warm hugs' },
    { r: 0, c: 1, emoji: '🍳', caption: 'Cooking chaos together' },
    { r: 0, c: 2, emoji: '🙌', caption: 'High-five — team us!' },
    { r: 1, c: 0, emoji: '😚', caption: 'Cheek kisses' },
    { r: 1, c: 1, emoji: '💻', caption: 'Work-from-home dates' },
    { r: 1, c: 2, emoji: '🫂', caption: 'Back hugs' },
    { r: 2, c: 0, emoji: '🤳', caption: 'Selfie moments' },
    { r: 2, c: 1, emoji: '❤️', caption: 'You have my whole heart' },
    { r: 2, c: 2, emoji: '👍', caption: 'We got this' },
    { r: 3, c: 0, emoji: '🎁', caption: 'Gifts & ice cream' },
    { r: 3, c: 1, emoji: '🐨', caption: 'Piggyback rides' },
    { r: 3, c: 2, emoji: '🤝', caption: 'Holding hands everywhere' },
    { r: 4, c: 0, emoji: '🌙', caption: 'Stargazing nights' },
    { r: 4, c: 1, emoji: '🧋', caption: 'Miss you' },
    { r: 4, c: 2, emoji: '📖', caption: 'Cozy reading cuddles' },
  ],

  // Memory-match uses these pairs (emoji fallback if no photos)
  memoryEmojis: ['💖', '🥟', '🌸', '🎀', '🧸', '⭐'],

  // Reasons revealed by the Love Meter game
  reasons: [
    'Your smile that fixes my whole day 🥰',
    'Your eyes I keep getting lost in ✨',
    'Your endless, gentle kindness 💞',
    'How considerate you always are 🌷',
    'How deeply and fully you love 💗',
    'Just… you. Every single part of you. 💫',
  ],

  // Relationship quiz — placeholder questions, edit freely!
  // `answer` is the index (0-based) of the correct option.
  quiz: [
    {
      question: 'What do I love most the moment I see you?',
      options: ['Your smile', 'Your outfit', 'Your phone'],
      answer: 0,
    },
    {
      question: 'Where did our story officially begin?',
      options: ['Din Tai Fung', 'Hinge', 'The movies'],
      answer: 1,
    },
    {
      question: 'What am I always down to do with you?',
      options: ['Argue', 'Anything, as long as it’s together', 'Nothing'],
      answer: 1,
    },
    {
      question: 'How long do I want this to last?',
      options: ['A while', 'Forever and then some', 'Undecided'],
      answer: 1,
    },
  ],

  // Short sweet notes revealed after each mini-game
  notes: {
    memory: {
      title: 'You remembered 💞',
      body: 'You always remember the little things — and that’s one of a hundred reasons I adore you.',
    },
    quiz: {
      title: 'You know us so well 🥹',
      body: 'Every answer, every memory — proof that we’re the real thing. My favorite person, always.',
    },
    scratch: {
      title: 'A little secret ✨',
      body: 'No matter what kind of day it is, you are the best part of mine.',
    },
    puzzle: {
      title: 'Piece by piece 🧩',
      body: 'You’re the piece I didn’t know my life was missing. Now everything fits.',
    },
    lovemeter: {
      title: 'It overflowed 💗',
      body: 'Turns out there’s no number big enough. I just love you — endlessly.',
    },
  },

  // The grand finale letter — unlocked after all games are done
  finale: {
    title: 'My Love,',
    body: `i never trusted my life to give me another chance to fall in love and take it all in. but when we texted for the first time i knew we had something.

even when we have our odds, we have a cute way of blending them — a cute way of liking each other, loving each other, compromising for each other.`,
    signoff: 'my best, my love. i love you. 💗',
  },
}
