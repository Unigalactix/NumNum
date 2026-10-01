// Whole, original notes: never stitch fragments together to inflate the collection.
const NOTE_BODIES = {
  joke: [
    'Are you a croissant? Because I keep falling for your layers. 🥐😘',
    'My heart has one employee of the month. Somehow you win every month. 🏆💗',
    'I tried to play it cool. Then you smiled. Very unprofessional of you. 😎💞',
    'Our relationship has excellent Wi-Fi: even my bad jokes connect with you. 📶😂',
    'I ordered one lifetime of you. The delivery estimate says forever. 📦🥰',
    'You must be a chess queen: suddenly all my plans revolve around you. ♟️😘',
    'I would share my last dosa with you. Please appreciate this serious commitment. 🥞💗',
    'I have a crush on my girlfriend. Should I tell her, or is this notification enough? 🤭💌',
    'Wanted: the girl who stole my heart. Reward: more of my terrible jokes. 🔎😂',
    'My love language is sending you nonsense and hoping you snort-laugh. 😁💞',
    'You are my emergency contact for an outbreak of missing-you-itis. ☎️🥰',
    'I was going to write a clever joke, but all my brain cells said Neha. 🧠💗',
    'If we were socks, I would still pick you after the washing machine mixed us up. 🧦😘',
    'Breaking news: local boy remains ridiculously pleased that you like him back. 📰😁',
    'My heart asked for your number. I told it to relax; we already matched. 📱💘',
    'I am not clingy. I am a very affectionate phone notification. Totally different. 🤗😂',
    'You are the only person I would lose at Catan for. Accidentally, obviously. 🎲😇',
    'Do you have a map? I got distracted by your face again. 🗺️🥰',
    'I love you a waffle lot. This joke is terrible, but my intentions are butter. 🧇😘',
    'You have a lifetime subscription to my hugs. Cancellation is not in the settings. 🤗💗',
  ],
  memory: [
    'April 3: one Hinge match quietly changed what every ordinary day would mean to me. 💞',
    'Our first call lasted 3 hours, 11 minutes, 39 seconds. Catan had excellent company. 🎲☎️',
    'Four hours, seven minutes, one second on our second call. Apparently we had a little to say. ☎️🤭',
    'May 15: my girl graduated from USC. Still proud of you, still cheering loudly. 🎓💗',
    'May 16: someone proposed to someone. Those two someones are still my favorite mystery. 😁💘',
    'Our first WhatsApp video call: finally a face to go with all those hours of talking. 📱🥰',
    'July 15: our first meal together, in real life. A date I will always keep close. 🍽️💞',
    'Our first movie was Spider-Man: Brand New Day. Our own little first chapter at the movies. 🎬💗',
    'Your first Amazon morning, and our walk to the office together. A small moment I keep. 😘',
    'The Spheres and the Banana Stand: a very us combination of exploring and snacks. 🍌🌿',
    'Face masks and the Rahul Subramanian show. August 8 had a lovely sense of humor. 🧖‍♀️😂',
    'Our first Bainbridge ferry ride. I like that we keep finding new places to be us. ⛴️💞',
    'A Minion sticker, pineapple eggless cake, and you celebrating me. Best birthday ingredients. 🎂💛',
    'Croissants, Pike Place, Cheesecake Factory, Irumudi: August 22 really understood the assignment. 🥐🎬',
    'Num Num has a half birthday, because one date on the calendar cannot contain all this cuteness. 🎂😘',
    'That big chessboard in South Lake Union: even our little competition became a memory. ♟️💗',
    'Our couple caricature and the U-District. One more version of us to keep forever. 🎨🥰',
    'You passed your driving knowledge test. I reserve the right to remain very proud of you. 🚗💞',
    'Moonlight kayaking on Lake Union with Sergio. A night that deserves its own little frame. 🛶🌙',
    'September 26: Columbia Center Skydeck, city lights, and a photo of my favorite two-person team. 🌃💗',
  ],
  love: [
    'You never have to earn a soft place with me. You already have one, exactly as you are. 🌷💗',
    'I like our big days. I love our ordinary ones, too: the walks, the talking, the being there. 🫶',
    'A little reminder: your tired self is just as loved as your sparkling self. 🤗💞',
    'I want the grocery lists and the grand adventures. Mostly, I want them with you. 🥐💗',
    'My favorite future is not fancy. It just has you in the room. 🏡🥰',
    'You make being thoughtful feel easy. I see something lovely and want to tell you about it. 🌷💌',
    'Some days love is a big speech. Today it is this little note saying I am on your side. 💗',
    'I hope you feel loved in the quiet moments, not only when I find the perfect words. 🕯️💞',
    'You are not another thing on my to-do list. You are the person I want to tell about my day. 💌',
    'No clever line today. Just me, very sincerely happy that you exist. 🥰🌷',
    'You can have a difficult day and still be doing beautifully. Rest is allowed, my love. 🤗',
    'Thank you for letting me know the real you, not just the polished version. I love that girl. 💞',
    'I am collecting the tiny ways you make my life gentler. The collection keeps growing. 🌿💗',
    'We do not need a special occasion for me to choose you again. A regular day will do. 🫶',
    'If today asks too much of you, remember you do not have to carry it all alone. 🤗💗',
    'I love your excitement about the small things. Please keep showing me what makes you happy. 🥐🥰',
    'I hope our little world always feels like somewhere you can take a deep breath. 🌿💞',
    'Loving you has made everyday life feel worth paying closer attention to. ☀️💗',
    'You are allowed to be proud of yourself. I certainly am proud of you. 🌷🫶',
    'Whatever the next chapter looks like, I am glad we get to write it together. 📖💞',
  ],
  tinglish: [
    'NUVVU ADRUSTAVANTHURALIVI PAPA 😌💗',
    'ENNI POOJALU CHESAVO, NEEKU NEN DORKIA HIHIHI 😂💞',
    'Neeku okati telsa papa, i love you moreee. Argument ledu, final decision. 🤭💗',
    'Bangaram, nee smile chusi naa brain konchem holiday ki vellindi. 🥰🌴',
    'Bujji, nuvvu busy ani telusu. Oka chinna hug ikkada petti velthunna. 🤗💞',
    'Papa, nee gurinchi alochisthu navvukuntunna. Normal ga behave cheyyadam kastam. 😁💗',
    'Num Num, naaku nee stories anni kaavali. Chinna details kuda skip cheyyaku. 💌🥰',
    'Oka important announcement: nuvvu cute. Inko announcement: nenu lucky. 📣😘',
    'Bangaram, work pakkana petti oka deep breath teesuko. Nee best chaalu. 🌷💗',
    'Nee kosam raspberry croissant, naa kosam nee happy face. Fair deal kada? 🥐🤭',
    'Papa, chess lo gelichina odina, nee pakkana kurchovadam naaku win. ♟️💞',
    'Nuvvu navvithe chaalu bujji. Migilina day automatic ga better aipothundi. 😊💗',
    'Nee favorite color purple. Naa favorite person nuvvu. Easy quiz kada? 💜😘',
    'Num Num, oka small break teesuko. Naa nonsense notification ki kuda time ivvali. 😂💌',
    'Nuvvu unte normal walk kuda cute date aipothundi, bangaram. 🌿🥰',
    'Bujji, lunch marchipoku. Love tho chepthunna, konchem bossiness tho kuda. 🥞🤭',
    'Papa, i love you moreeeee. Extra letters ki extra charge ledu. 💗😂',
    'Nee day ela unna sare, naa daggara oka hug ready ga untundi. 🤗💞',
    'Eyyy papa, pandhi la aruvu okasari, hihi... i love you. 🐷😂💗',
    'PAPAAAAAAAAAAAAAAAA, oka smile ivvu. Adhe naa favorite gift. 😘💗',
  ],
  goldie: [
    'Goldie here! I fetched this notification. It smells suspiciously like Rajesh missing you. 🐕💌',
    'Woof report: you are loved. I checked twice, then got distracted by a tennis ball. 🐶🎾',
    'I brought you a stick. Rajesh brought a love note. Mine is clearly more practical. 🐕🪵',
    'Goldie says: stretch your paws, have some water, accept one imaginary nose boop. 🐾💧',
    'Important puppy business: you have been selected for unlimited tail wags today. 🐶💛',
    'I cannot spell croissant, but I can supervise you eating one. Love, Goldie. 🐕🥐',
    'My golden-retriever advice: greet your favorite person like they have been gone forever. 🐶💞',
    'Goldie delivery! One pocket-sized cuddle and absolutely no sensible work advice. 🐾🤗',
    'I hid a little happiness in your day. Check near the snacks. That is where I would look. 🐶🍪',
    'Your puppy assistant recommends a short walk and a very long hug. 🐕🌿',
    'I tried to carry all the love Rajesh sent. Needed a bigger tennis ball. 🐶🎾💗',
    'Goldie here. If today feels ruff, we can sit quietly together for a minute. 🐕💛',
  ],
  cartoon: [
    'Cartoon break! Five minutes of silly, zero minutes of being a perfectly sensible adult. 📺😁',
    'Rajesh proposes a Shin-chan break and snacks. This is a very serious relaxation strategy. 📺🍪',
    'Your cartoon-corner mission: make a ridiculous face, then pretend this was productivity. 😜📺',
    'Today deserves an interval, a snack, and the kind of laugh you cannot keep quiet. 🍿😂',
    'A note from the mischief corner: being a little silly is allowed, even on a busy day. 😁💛',
    'Please report to the sofa for important cartoon research. Snacks are part of the curriculum. 📺🥐',
    'Rajesh has scheduled absolutely nothing sensible for your next tiny break. Enjoy. 🤭💗',
    'Shin-chan on the screen, Num Num with a snack: a very good little plan for later. 📺💞',
    'Permission slip: one goofy dance, signed by your extremely unofficial fun department. 🕺😂',
    'Cartoon logic for today: if the day gets dramatic, add a snack and an intermission. 🍪📺',
    'Your inner giggly person called. She would like some screen time and no homework. 😁💛',
    'A little nonsense is good company. Conveniently, you have a boyfriend with a lifetime supply. 🤭💞',
  ],
}

export const NOTE_THEMES = ['joke', 'memory', 'love', 'tinglish']
export const NOTE_PERIODS = ['morning', 'afternoon', 'night']
const TITLES = {
  joke: 'Rajesh’s terrible joke 😁',
  memory: 'A little memory of us 💞',
  love: 'Just because I love you 💌',
  tinglish: 'Oka chinna love note 💗',
  goldie: 'A delivery from Goldie 🐶',
  cartoon: 'Our cartoon corner 📺',
}

export const noteCollections = Object.fromEntries(Object.entries(NOTE_BODIES).map(([theme, bodies]) => [
  theme,
  bodies.map((body, index) => ({
    id: `${theme}-${index + 1}`,
    theme,
    body: /\p{Extended_Pictographic}/u.test(body) ? body : `${body} 💗`,
    title: TITLES[theme],
    sender: theme === 'goldie' ? 'goldie' : 'rajesh',
    isTinglish: theme === 'tinglish',
  })),
]))

function hash(value) {
  let result = Math.imul(value ^ 0x45d9f3b, 0x45d9f3b)
  result = Math.imul(result ^ (result >>> 16), 0x45d9f3b)
  return (result ^ (result >>> 16)) >>> 0
}

// One stable schedule across all three sends: retries never advance a hidden cursor.
// Main themes are four slots apart; each whole note waits at least 80 slots to repeat.
// Companion visits occupy separated, varying slots in each eight-day block.
export function loveNoteForSlot(dayNumber, period) {
  if (!Number.isSafeInteger(dayNumber) || dayNumber < 0 || dayNumber > Math.floor(Number.MAX_SAFE_INTEGER / 3) - 1) {
    throw new Error(`Invalid love-note day: ${dayNumber}`)
  }
  const periodIndex = NOTE_PERIODS.indexOf(period)
  if (periodIndex < 0) throw new Error(`Unknown love-note period: ${period}`)
  const slot = dayNumber * 3 + periodIndex
  const block = Math.floor(slot / 24)
  const blockSlot = slot % 24
  let theme = NOTE_THEMES[slot % NOTE_THEMES.length]
  let ordinal = Math.floor(slot / NOTE_THEMES.length)
  if (blockSlot === 2 + hash(block) % 6) {
    theme = 'goldie'
    ordinal = block
  } else if (blockSlot === 14 + hash(block + 101) % 6) {
    theme = 'cartoon'
    ordinal = block
  }
  const collection = noteCollections[theme]
  const index = ordinal % collection.length
  return { ...collection[index], index }
}

export function validateNoteCollections() {
  const seen = new Set()
  for (const notes of Object.values(noteCollections)) {
    for (const note of notes) {
      if (!note.body || note.body.length > 120 || !/\p{Extended_Pictographic}/u.test(note.body)) {
        throw new Error(`Invalid notification ${note.id}: requires an emoji and at most 120 characters (${note.body.length}).`)
      }
      if (seen.has(note.body)) throw new Error(`Duplicate notification: ${note.id}`)
      seen.add(note.body)
    }
  }
}
