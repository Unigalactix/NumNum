// ─────────────────────────────────────────────────────────────
//  💗  ALL YOUR PERSONAL CONTENT LIVES HERE  💗
//  Edit any text below. Drop photos into /public/assets and set
//  the filenames in `photos` to use real pictures in the games.
// ─────────────────────────────────────────────────────────────

const STICKER_PAGE_DEFINITIONS = [
  { key: 'sheet1', source: 'assets/stickers/sheet.png', count: 15, title: 'Everyday Us', caption: 'the little moments 💗' },
  { key: 'sheet2', source: 'assets/stickers/sheet2.png', count: 6, title: 'Silly Little Days', caption: 'our goofy side 🥰' },
  { key: 'sheet3', source: 'assets/stickers/sheet3.png', count: 8, title: 'Us, Being Us', caption: 'just the two of us 💞' },
  { key: 'sheet4', source: 'assets/stickers/sheet4.png', count: 8, title: 'Pinch, Honk & Giggles', caption: 'endless teasing 😆' },
  { key: 'sheet5', source: 'assets/stickers/sheet5.png', count: 8, title: 'Your Daily Cuteness', caption: 'you, all day long ☕' },
  { key: 'sheet6', source: 'assets/stickers/sheet6.png', count: 4, title: 'More of Our Moments', caption: 'a few more of us 💫' },
  { key: 'sheet7', source: 'assets/stickers/sheet7.png', count: 8, title: 'Cozy Date Nights', caption: 'stay-in dates 🕯️' },
  { key: 'sheet8', source: 'assets/stickers/sheet8.png', count: 6, title: 'Boba Thefts & Teasing', caption: 'mine now! 🧋' },
  { key: 'sheet9', source: 'assets/stickers/sheet9.png', count: 8, title: 'Our LA Adventure', caption: 'city of angels 🌴' },
  { key: 'sheet10', source: 'assets/stickers/sheet10.png', count: 8, title: 'Our Seattle Trip', caption: 'rainy-day us ☔' },
]

export const stickerPages = STICKER_PAGE_DEFINITIONS.map((page) => ({
  ...page,
  stickers: Array.from({ length: page.count }, (_, index) => {
    const number = String(index + 1).padStart(2, '0')
    const id = `${page.key}-${number}`
    return {
      id,
      file: `assets/stickers/individual/${id}.png`,
      label: `${page.title}, sticker ${index + 1}`,
      notificationFile: `assets/stickers/notification/${id}.jpg`,
      page: page.key,
    }
  }),
}))

export const stickerCollection = stickerPages.flatMap((page) => page.stickers)

export const content = {
  her: { name: 'Neha', nickname: 'Num Num' },

  site: {
    title: 'For My Num Num',
    tagline: 'a tiny universe I built, just for you 💗',
  },

  // The entry gate — she must enter the passcode to open the site.
  gate: {
    question: 'Before you come in… enter our six-digit passcode.',
    passcode: '081974',
    success: 'That’s it. Come in, my love… 💕',
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

  // Individual stickers are generated from every source sheet with
  // scripts/extract-stickers.ps1.
  stickerPages,
  stickerCollection,

  // Memory-match uses these pairs (emoji fallback if no photos)
  memoryEmojis: ['💖', '🥐', '📺', '🐕', '🎀', '⭐'],

  favorites: [
    { emoji: '🥐', label: 'Raspberry croissants' },
    { emoji: '📺', label: 'Shin-chan' },
    { emoji: '🐕', label: 'Golden retrievers' },
    { emoji: '💜', label: 'Purple' },
  ],

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
          'Raspberry croissants 🥐',
          'Shin-chan 📺',
          'Golden retrievers 🐕',
          'Something flaky, something funny, something furry',
          'All three make your eyes light up ✨',
        ],
        options: ['My shopping list', 'Num Num’s favorite things', 'Date ideas', 'Birthday gifts'],
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

  // The dates that shaped our story, shown in the History of Us timeline.
  history: [
    {
      date: 'August 17th, 1999',
      emoji: '🎂',
      title: 'Rajesh was born',
    },
    {
      date: 'February 23rd, 2001',
      emoji: '💗',
      title: 'Neha, my Num Num, was born',
    },
    {
      date: 'April 3rd, 2026',
      emoji: '💞',
      title: 'We matched on Hinge',
      since: '2026-04-03',
      countLabel: 'since we matched',
    },
    { date: 'May 15th, 2026', emoji: '🎓', title: 'You graduated from USC' },
    {
      date: 'May 16th, 2026',
      emoji: '😁',
      title: 'Someone proposed to someone',
      detail: 'Hint: one someone is you, and the other is me.',
      since: '2026-05-16',
      countLabel: 'since the proposal',
    },
    { date: 'May 17th, 2026', emoji: '📱', title: 'Our first video call on WhatsApp' },
    {
      date: 'July 15th, 2026',
      emoji: '🍽️',
      title: 'We met in person and shared our first meal',
      since: '2026-07-15',
      countLabel: 'since we first met',
    },
    {
      date: 'August 2nd, 2026',
      emoji: '🎬',
      title: 'Our first movie together',
      detail: 'Spider-Man: Brand New Day.',
    },
    {
      date: 'August 3rd, 2026',
      emoji: '😘',
      title: 'Your first day at Amazon',
      detail: 'We walked to the office together.',
    },
    {
      date: 'August 7th, 2026',
      emoji: '🍌',
      title: 'Our first visit to the Amazon Spheres and Banana Stand',
    },
    {
      date: 'August 8th, 2026',
      emoji: '🧖‍♀️',
      title: 'Face masks as a couple and the Rahul Subramanian show',
    },
    { date: 'August 15th, 2026', emoji: '⛵', title: 'Our first ferry ride to Bainbridge Island' },
    {
      date: 'August 16th & 17th, 2026',
      emoji: '🎂',
      title: 'You celebrated my birthday',
      detail: 'With a Minion sticker on a pineapple-flavor eggless cake.',
      since: '2026-08-16',
      countLabel: 'since my birthday celebration',
    },
    {
      date: 'August 22nd, 2026',
      emoji: '🥐',
      title: 'A full Seattle date with my Num Num',
      detail: 'Raspberry croissants at the farmers market, the Gum Wall and Pike Place Market, Cheesecake Factory, and Irumudi.',
    },
    {
      date: 'August 23rd, 2026',
      emoji: '🐕',
      title: 'Num Num’s half birthday',
      detail: 'A little celebration for my favorite girl. 💗',
    },
    {
      date: 'August 27th, 2026',
      emoji: '♟️',
      title: 'We played chess on a big public board',
      detail: 'A playful match in South Lake Union.',
    },
    {
      date: 'August 30th, 2026',
      emoji: '🎨',
      title: 'We had our couple caricature drawn',
      detail: 'Then we spent the day together in the U-District.',
      image: 'assets/caricature.png',
      imageAlt: 'Couple caricature of Rajesh and Neha with the Seattle skyline and Space Needle',
    },
    {
      date: 'September 1st, 2026',
      emoji: '🚗',
      title: 'You passed your driving knowledge test',
      detail: 'And you skipped your shower 😛',
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
    arrowtrail: {
      title: 'Every arrow found you ↪️',
      body: 'No matter how the path twists and turns, every little direction still leads me back to you.',
    },
    sweetmatch: {
      title: 'The sweetest match 🍬',
      body: 'Of all the possible matches in the whole wide world, I still can’t believe I got the sweetest one.',
    },
    pocketblocks: {
      title: 'We fit perfectly 🧱',
      body: 'Somehow all our odd little edges fit together into something steady, bright, and completely ours.',
    },
    duckhunt: {
      title: 'You caught every moment 🦆',
      body: 'The best moments can fly by so quickly — I love that we keep finding and holding onto ours.',
    },
  },

  // Past love letters — every current and future entry uses the shared typing animation.
  // To add a new letter, drop an object at the TOP of this list and set `date`
  // to the moment you wrote it, e.g. 'August 12, 2026 · 10:30 AM'.
  previousLetters: [
    {
      date: 'August 20, 2026 · 11:13 AM',
      title: 'Thank You, My Num Num 💗',
      body: `thank you for making me feel comfortable when i was at my lowest. thank you for taking care of me when i was at my worst. thank you for making my 27th birthday so memorable, for the gifts, and for all the time you’ve given me. 🥹🎂🎁

i’m sorry for hurting your feelings and for not making you feel safe in this relationship. i promise to be a better boyfriend. i’ll try to be more honest and truthful with you, always. 🤍🫂

i love you, yaar. please be my pandhi forever. 🐷💞`,
      signoff: 'yours, trying to be better every day. i love you. 💗',
    },
    {
      date: 'August 7, 2026 · 10:30 AM',
      title: 'My Love,',
      body: `i never trusted my life to give me another chance to fall in love and take it all in. but when we texted for the first time i knew we had something.

even when we have our odds, we have a cute way of blending them — a cute way of liking each other, loving each other, compromising for each other.`,
      signoff: 'my best, my love. i love you. 💗',
    },
  ],

  // The Love Letter (finale). Change `version` whenever a new letter is added;
  // this resets progress and creates a fresh set of five required games.
  finale: {
    version: '2026-08-20T11:13',
    awaiting: true,
    title: 'Awaiting a new letter…',
    body: `there isn’t a new letter waiting here just yet — but this little box will always stay open for you. 💌`,
    signoff: 'come back soon, my Num Num. 💗',
  },
}
