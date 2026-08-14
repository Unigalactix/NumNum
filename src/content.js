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
    question: 'Before you come in… answer this. What was the first movie we watched in a theatre?',
    // Any of these (case/spacing/punctuation-insensitive) unlocks the gate.
    answers: ['Spider Man Brand New Day', 'Brand New Day'],
    answer: 'Spider-Man: Brand New Day',
    // Shown when she types just “Spider Man” without the rest.
    almost: 'So close, my love 🥰 you’ve got the hero right… now give me the rest of it 💫',
    hint: 'Okay okay… our very first theatre date 🎬🍿 — you totally know this one 💗',
    success: 'Yesss — that’s the one. Come in, my love… 💕',
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
  stickerSheet: {
    file: 'assets/stickers/sheet.png',
    cols: 3,
    rows: 5,
    cellAspectRatio: 1.25,
  },
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

  // Sticker Book album — each sheet is shown as a full, flip-through page.
  // Drop more sheets into public/assets/stickers/ and add a line here.
  stickerPages: [
    { file: 'assets/stickers/sheet.png', title: 'Everyday Us', caption: 'the little moments 💗' },
    { file: 'assets/stickers/sheet2.png', title: 'Silly Little Days', caption: 'our goofy side 🥰' },
    { file: 'assets/stickers/sheet3.png', title: 'Us, Being Us', caption: 'just the two of us 💞' },
    { file: 'assets/stickers/sheet4.png', title: 'Pinch, Honk & Giggles', caption: 'endless teasing 😆' },
    { file: 'assets/stickers/sheet5.png', title: 'Your Daily Cuteness', caption: 'you, all day long ☕' },
    { file: 'assets/stickers/sheet6.png', title: 'More of Our Moments', caption: 'a few more of us 💫' },
    { file: 'assets/stickers/sheet7.png', title: 'Cozy Date Nights', caption: 'stay-in dates 🕯️' },
    { file: 'assets/stickers/sheet8.png', title: 'Boba Thefts & Teasing', caption: 'mine now! 🧋' },
    { file: 'assets/stickers/sheet9.png', title: 'Our LA Adventure', caption: 'city of angels 🌴' },
    { file: 'assets/stickers/sheet10.png', title: 'Our Seattle Trip', caption: 'rainy-day us ☔' },
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

  // "A Secret For You" (Scratch card) — the reveal changes with WHEN she opens it.
  // Buckets: morning (5–11), afternoon (12–16), evening (17–20), night (21–4),
  // plus a special weekend set and a `default` fallback. One is picked at random
  // from the matching bucket, so it feels fresh each time.
  secrets: {
    morning: [
      { title: 'good morning, num num ☀️', body: 'i hope your coffee’s warm and your day is soft. you’re my favorite thought to wake up to. 💗' },
      { title: 'morning, sleepyhead 🌅', body: 'somewhere out here i’m already smiling because you exist. go be wonderful today. ☕' },
    ],
    afternoon: [
      { title: 'hi, mid-day you 🌤️', body: 'a little reminder in the middle of your busy day — you’re loved, deeply, exactly as you are. 💕' },
      { title: 'afternoon pick-me-up ☕', body: 'whatever the day’s throwing at you, i’m in your corner. take a breath, my love. 💫' },
    ],
    evening: [
      { title: 'good evening, my love 🌇', body: 'the day’s winding down and i’m thinking of you, like always. you made today better just by being in it. 💗' },
      { title: 'evening, gorgeous 🌆', body: 'come rest — you did so much today. i’m so proud of you, and so lucky it’s you. 🕯️' },
    ],
    night: [
      { title: 'sweet dreams, num num 🌙', body: 'if you’re reading this late, put the phone down soon, okay? dream of us. i’ll be right here. 💤' },
      { title: 'late-night secret ✨', body: 'the world’s quiet now, but my heart’s still loud about you. goodnight, my whole heart. 🌛' },
    ],
    weekend: [
      { title: 'happy weekend, my love 🥞', body: 'no rushing today. slow mornings, your laugh, maybe boba later — i just want the whole day with you. 💗' },
      { title: 'weekend mode: us 🧋', body: 'two days of you-and-me energy. cuddles, cooking chaos, zero plans required. you + me is the plan. 💞' },
    ],
    default: [
      { title: 'a little secret ✨', body: 'no matter what kind of day it is, you are the best part of mine.' },
      { title: 'just because 💌', body: 'no reason, no occasion — i just love you. that’s the whole secret. 💗' },
    ],
  },

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
    {
      question: 'What was the first movie we watched in a theatre?',
      options: ['Spider-Man: Brand New Day', 'Barbie', 'Inside Out 2'],
      answer: 0,
    },
  ],

  // Pinpoint (LinkedIn-style): guess what connects the clues, revealed one by one.
  pinpoint: {
    intro: 'Five little clues, revealed one at a time. Guess what connects them 💭',
    rounds: [
      {
        clues: [
          'Soup dumplings 🥟',
          'String beans 🫛',
          'Fried rice 🍚',
          'A whole lot of nervous smiles 😊',
          'Din Tai Fung 🍜',
        ],
        options: ['A random Tuesday', 'Our first date', 'Your birthday', 'Movie night'],
        answer: 1,
      },
      {
        clues: [
          'It fixes my whole day 🥰',
          'I see it and forget my words',
          'It shows up in every photo 📸',
          'The first thing I look for',
          'The last thing I think about at night',
        ],
        options: ['Your laugh', 'Your smile', 'Your cooking', 'Your playlist'],
        answer: 1,
      },
      {
        clues: [
          'Boba runs 🧋',
          'Late-night talks 🌙',
          'Cooking chaos together 🍳',
          'Cozy reading cuddles 📖',
          'Absolutely anything — as long as it’s with you',
        ],
        options: ['My hobbies', 'Our favorite things to do', 'Chores', 'Errands'],
        answer: 1,
      },
      {
        clues: [
          'Big screen, dim lights 🎬',
          'A shared tub of popcorn 🍿',
          'Our very first theatre date',
          'A friendly neighborhood hero 🕷️',
          'Spider-Man: Brand New Day',
        ],
        options: ['A cozy night in', 'Our first movie in a theatre', 'A concert', 'A road trip'],
        answer: 1,
      },
    ],
  },

  // Wend (word-search): trace these sweet words hidden in the letter grid.
  wend: {
    words: ['LOVE', 'KISS', 'HUG', 'CUTE', 'BOBA', 'SMILE', 'NEHA', 'FOREVER'],
  },

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
    pinpoint: {
      title: 'You pinpointed us 🎯',
      body: 'A few tiny clues and you saw the whole picture — because you just get us.',
    },
    tango: {
      title: 'Perfectly balanced 💗⭐',
      body: 'Hearts and stars, all in their right place — kind of like how we fit together.',
    },
    sudoku: {
      title: 'Everything in its place 🔢',
      body: 'You sorted every little piece into place — steady and patient, just like you love me.',
    },
    zip: {
      title: 'One perfect path 🧵',
      body: 'One line, touching everything, in just the right order — that’s the path that led me to you.',
    },
    wend: {
      title: 'You found every word 💌',
      body: 'Little words hidden everywhere — and you found them all, the way you always find the good in everything.',
    },
    patches: {
      title: 'You colored us in 🎨',
      body: 'Every little patch in its own happy color — you make my whole world brighter, my love.',
    },
  },

  // Past love letters — kept safe here; each opens with the same envelope + typing.
  // To add a new letter, drop an object at the TOP of this list and set `date`
  // to the moment you wrote it, e.g. 'August 12, 2026 · 10:30 AM'.
  previousLetters: [
    {
      date: 'August 7, 2026 · 10:30 AM',
      title: 'My Love,',
      body: `i never trusted my life to give me another chance to fall in love and take it all in. but when we texted for the first time i knew we had something.

even when we have our odds, we have a cute way of blending them — a cute way of liking each other, loving each other, compromising for each other.`,
      signoff: 'my best, my love. i love you. 💗',
    },
  ],

  // The Love Letter (finale) — currently awaiting the next one to be written.
  // `awaiting: true` means there's no new letter, so the finale opens freely
  // (no need to finish the games). Set it to false when a real letter is added.
  finale: {
    awaiting: true,
    title: 'Awaiting a new letter…',
    body: `no new letter waiting just yet, my love — but there’s always another one on the way. 💌

until then, every letter i’ve written you is kept safe in “Previous Letters.” reread them whenever you miss my words. 💗`,
    signoff: 'yours, always. 💗',
  },
}
