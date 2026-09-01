const OPENERS = [
  'Good morning, Num Num.',
  'Morning, you.',
  'Hope you slept well.',
  'A quick note before work:',
  'Starting your day with this:',
  'Just popping in this morning:',
  'Before your coffee kicks in:',
  'A small hello for your morning:',
  'Hope your morning is going well.',
  'Before the day gets busy:',
]

const THOUGHTS = [
  'I hope today gives you a few easy wins.',
  'I was thinking about you and smiling.',
  'I hope work is kind to you today.',
  'Life feels a little better with you in it.',
  'I hope you get a calm start and good coffee.',
  'I am looking forward to hearing how your day goes.',
  'You make regular weekdays feel a bit more special.',
  'I hope something unexpectedly nice happens today.',
  'I am glad I get to share the everyday stuff with you.',
  'Seeing your name still makes me smile.',
]

const CLOSERS = [
  'Have a good day, love.',
  'Talk to you later.',
  'Do not forget breakfast.',
  'Take it one thing at a time.',
  'Save me one story from your day.',
  'I am rooting for you.',
  'See you after work.',
  'Go be your lovely self.',
  'Sending you a little kiss.',
  'You have got this.',
]

const MORNING_TINGLISH_NOTES = [
  { title: 'Good morning, bangaram', body: 'Good morning bangaram. Baaga nidrapoyava? Ee roju work easy ga vellali.' },
  { title: 'Morning, bujji', body: 'Le bujji, coffee time. Breakfast kuda marchipoku, okay?' },
  { title: 'Coffee first', body: 'Num Num, mundu coffee tagu. Migilina day tarvatha chusukundam.' },
  { title: 'Slow ga start cheyyi', body: 'Nidra saripoyinda? Tondara emi ledu, nee pace lo day start cheyyi.' },
  { title: 'Morning thought', body: 'Poddunne nee gurthochindi, so oka small good morning cheppali anipinchindi.' },
  { title: 'Have a good day', body: 'Good morning bangaram. Ee roju konni easy wins ravali neeku.' },
  { title: 'Morning check-in', body: 'Morning ela undi? Calm ga start ayindi ani hope chestunna.' },
  { title: 'Oka nice day', body: 'Ee roju edaina unexpectedly nice ga jaragali neeku.' },
  { title: 'First, breakfast', body: 'Morning Num Num. Work start chese mundu emaina tinu, please.' },
  { title: 'Just saying hi', body: 'Poddunne oka hi cheppadaniki vachanu. Have a good day, love.' },
  { title: 'Inko five minutes?', body: 'Inko five minutes padukuntava? Sare, alarm matram miss avvaku.' },
  { title: 'Breakfast skip cheyyaku', body: 'Day busy ga unna sare, breakfast skip cheyyaku bangaram.' },
  { title: 'You will do well', body: 'Good morning, cutie. Ee roju kuda nuvvu baaga chestav ani telusu.' },
  { title: 'Peaceful morning', body: 'Morning peaceful ga start avvali. Talk to you after work.' },
  { title: 'Fresh start', body: 'Ninna ela unna sare, ee roju fresh start. One thing at a time.' },
  { title: 'Le, sleepyhead', body: 'Wake up bujji. Coffee ready chesko, day start cheddam.' },
  { title: 'Morning hug', body: 'Poddunne oka small hug pampisthunna. Have a nice day.' },
  { title: 'Easy wins', body: 'Num Num, ee roju work lo konni easy wins ravali ani hope chestunna.' },
  { title: 'Nee pace lo', body: 'Morning love. Tondara padaku, nee pace lo start cheyyi.' },
  { title: 'Talk later', body: 'Good morning, bangaram. Day ela vellindo later cheppu.' },
]

function distributePersonalNotes(baseNotes, personalNotes) {
  const overrides = new Map(
    personalNotes.map((note, position) => [
      Math.floor(((position + 0.5) * baseNotes.length) / personalNotes.length),
      note,
    ]),
  )

  return {
    englishIndices: baseNotes
      .map((_, index) => index)
      .filter((index) => !overrides.has(index)),
    notes: baseNotes.map((note, index) => overrides.get(index)?.body || note),
    personalIndicesList: [...overrides.keys()],
    personalIndices: new Set(overrides.keys()),
    titles: new Map([...overrides].map(([index, note]) => [index, note.title])),
  }
}

function noteFromCollection(collection, fallbackTitles, dayNumber, options = {}) {
  const { multiplier = 1, offset = 0, tinglish = false } = options
  const indices = tinglish ? collection.personalIndicesList : collection.englishIndices
  const index = indices[Math.abs(dayNumber * multiplier + offset) % indices.length]

  return {
    body: collection.notes[index],
    index,
    isTinglish: tinglish,
    title: collection.titles.get(index) || fallbackTitles[index % fallbackTitles.length],
  }
}

export const loveNoteTitles = [
  'Good morning, Num Num',
  'Morning, you',
  'Before work begins',
  'A quick morning note',
  'Your 9 AM hello',
  'Hope you slept well',
  'Coffee first',
  'Have a good day',
  'Before the day gets busy',
  'Just saying hi',
]

const generatedMorningNotes = OPENERS.flatMap((opener) =>
  THOUGHTS.flatMap((thought) =>
    CLOSERS.map((closer) => `${opener} ${thought} ${closer}`),
  ),
)
const morningCollection = distributePersonalNotes(generatedMorningNotes, MORNING_TINGLISH_NOTES)
export const loveNotes = morningCollection.notes

export function loveNoteForDay(dayNumber, options = {}) {
  return noteFromCollection(morningCollection, loveNoteTitles, dayNumber, options)
}

const AFTERNOON_OPENERS = [
  'How is your afternoon going?',
  'Quick check-in:',
  'Hope the day is treating you well.',
  'A little note between meetings:',
  'Midday hello, Num Num.',
  'Thinking of you this afternoon.',
  'How is work going?',
  'Just checking in, love.',
  'Before the last stretch:',
  'Your afternoon reminder:',
]

const ENCOURAGEMENTS = [
  'I hope you have had a chance to eat something.',
  'You are more than halfway through the day.',
  'Take a breath before the next thing.',
  'I hope work has been manageable today.',
  'No need to solve everything at once.',
  'You are doing fine, even if today feels messy.',
  'A short break might be exactly what you need.',
  'I am looking forward to seeing you later.',
  'I hope you find a quiet minute for yourself.',
  'Whatever today has been, you can leave it at work.',
]

const AFTERNOON_CLOSERS = [
  'Text me when you get a minute.',
  'Have some water, please.',
  'The evening is not too far away.',
  'I am thinking of you.',
  'Take care of yourself too.',
  'One thing at a time.',
  'See you soon, love.',
  'Hope the rest goes smoothly.',
  'Sending a small hug.',
  'You are doing just fine.',
]

const AFTERNOON_TINGLISH_NOTES = [
  { title: 'Konchem break teesuko', body: 'Ela undi day, bangaram? Time unte konchem break teesuko.' },
  { title: 'Water tagu, bujji', body: 'Busy ga unna sare, water tagu bujji. Afternoon reminder anuko.' },
  { title: 'Day ela undi?', body: 'Ee roju work ela undi? Free ayyaka cheppu, vintanu.' },
  { title: 'Half day done', body: 'Half day aipoyindi Num Num. Inko konchem, tarvatha relax avvu.' },
  { title: 'Oka deep breath', body: 'Oka deep breath teesuko bangaram. One thing at a time.' },
  { title: 'Break okay', body: 'Tired ga unte konchem break teesuko. Work ekkadiki podu.' },
  { title: 'Lunch ayinda?', body: 'Afternoon check-in: lunch ayinda, leka malli work lo marchipoyava?' },
  { title: 'See you later', body: 'Work finish chesko, evening kaluddam. Looking forward to it.' },
  { title: 'Step by step, bujji', body: 'Bujji, anni okesari kaadu. Step by step vellina chaalu.' },
  { title: 'You are doing fine', body: 'Day messy ga unna parledu. Nuvvu fine ga chestunnav.' },
  { title: 'Afternoon hello', body: 'Just oka small afternoon hi, endukante nee gurthochindi.' },
  { title: 'Tea time ayinda?', body: 'Tea time ayinda? Oka sip teesuko, konchem relax avvu.' },
  { title: 'One thing at a time', body: 'Work pressure ekkuva unda? One thing at a time, bangaram.' },
  { title: 'Almost evening', body: 'Evening daggarlo undi. Migilina work smooth ga vellali.' },
  { title: 'No rush', body: 'Anni perfect ga cheyyalsina avasaram ledu. Nee best chaalu.' },
  { title: 'Quick check-in', body: 'Ela unnav? Busy unte later reply cheyyi, just checking in.' },
  { title: 'Later cheppu', body: 'Day lo best part ento later cheppu. Naaku vinadam ishtam.' },
  { title: 'Slow avvadam okay', body: 'Tired ga unte slow avvu. Adi completely okay.' },
  { title: 'A small reminder', body: 'Num Num, water and lunch rendu important. Check chesko.' },
  { title: 'Inko konchem', body: 'Inko konchem, bangaram. Tarvatha work ni akkade vadilesi relax avvu.' },
]

export const afternoonNoteTitles = [
  'How is your day going?',
  'A quick check-in',
  'Afternoon, Num Num',
  'Between meetings',
  'Do not forget lunch',
  'Thinking of you',
  'For the last stretch',
  'One thing at a time',
  'Hope work is going well',
  'A small afternoon hello',
]

const generatedAfternoonNotes = AFTERNOON_OPENERS.flatMap((opener) =>
  ENCOURAGEMENTS.flatMap((encouragement) =>
    AFTERNOON_CLOSERS.map((closer) => `${opener} ${encouragement} ${closer}`),
  ),
)
const afternoonCollection = distributePersonalNotes(generatedAfternoonNotes, AFTERNOON_TINGLISH_NOTES)
export const afternoonNotes = afternoonCollection.notes

export function afternoonNoteForDay(dayNumber, options = {}) {
  return noteFromCollection(afternoonCollection, afternoonNoteTitles, dayNumber, {
    ...options,
    multiplier: 37,
    offset: 17,
  })
}
