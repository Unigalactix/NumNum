const OPENERS = [
  'Good morning, my love.',
  'Morning, beautiful.',
  'Wake up, my favorite person.',
  'A little morning note for you:',
  'Good morning, Num Num.',
  'Before the day gets busy:',
  'Hello, sleepyhead.',
  'Today starts with one truth:',
  'A soft morning reminder:',
  'The sun is up; so is my heart.',
]

const THOUGHTS = [
  'You make ordinary days feel quietly extraordinary.',
  'The world feels gentler because you are in mine.',
  'Your smile is my favorite start.',
  'You are loved exactly as you are.',
  'My heart keeps choosing you.',
  'You bring warmth to places you do not even notice.',
  'I am so grateful our stories found each other.',
  'You deserve every kind thing this day can bring.',
  'Even a busy day cannot make you less wonderful.',
  'Being yours makes me so happy.',
]

const CLOSERS = [
  'Go make today yours.',
  'Carry my love today.',
  'I am right here with you.',
  'Take today gently.',
  'May today feel lovely.',
  "You've got this, my love.",
  'Save a smile for me.',
  'Tell me about your day.',
  'May today surprise you.',
  'I love you more each day.',
]

const MORNING_TINGLISH_NOTES = [
  { title: 'Good morning, bangaram', body: 'Good morning bangaram. Nee smile tho day start chesthe, naaku kuda full happy ga untundi.' },
  { title: 'Le bujji', body: 'Le bujji, poddunne nee gurinche first thought. Ee roju super ga untundi, chudu.' },
  { title: 'Coffee mundu oka reminder', body: 'Num Num, coffee mundu oka reminder: nuvvu chaala special, adi marchipoku.' },
  { title: 'Slow morning, my love', body: 'Nidra saripoyinda bujji? Slow ga le, tension emi ledu. Nenu neethone unna.' },
  { title: 'Nee smile chaalu', body: 'Poddunne nee smile gurthosthe chaalu, na day automatic ga set aipothundi.' },
  { title: 'Manam handle cheddam', body: 'Good morning bangaram. Ee roju em jarigina, manam kalisi handle cheddam.' },
  { title: 'Morning inka andamga', body: 'Nuvvu unnav ane thought tho morning inka konchem andamga untundi.' },
  { title: 'Happy moments neeke', body: 'Ee roju chinna chinna happy moments anni nee daggarake ravali.' },
  { title: 'First, deep breath', body: 'Morning Num Num. First deep breath teesuko, tarvatha world ni handle cheddam.' },
  { title: 'Na life lo best part', body: 'Poddunne cheppali anipinchindi: nuvvu na life lo best part.' },
  { title: 'Inko five minutes?', body: 'Inko five minutes padukuntava? Sare, kani lechaka oka cute smile ivvali.' },
  { title: 'Breakfast skip cheyyaku', body: 'Nee day busy aina sare, breakfast skip cheyyaku bangaram.' },
  { title: 'Just nuvvula undu', body: 'Good morning cutie. Nuvvu just nuvvula unte chaalu, ade naaku ishtam.' },
  { title: 'Soft morning neekosam', body: 'Ee morning soft ga, peaceful ga, nee smile la undali.' },
  { title: 'Fresh start, bangaram', body: 'Ninna ela unna sare, ee roju fresh start. Nenu full ga nee side.' },
  { title: 'Na sunshine ekkada?', body: 'Wake up bujji. Bayata sun vachindi, na sunshine inka nidralone unda?' },
  { title: 'Oka tight hug', body: 'Poddunne oka virtual hug pampisthunna. Tight ga pattuko.' },
  { title: 'Naaku already telusu', body: 'Num Num, ee roju kuda nuvvu amazing ga untav. Naaku already telusu.' },
  { title: 'Nee pace lo start cheyyi', body: 'Morning love. Tondara padaku, nee pace lo start cheyyi.' },
  { title: 'Na world ki morning', body: 'Nuvvu lechav ante chaalu, na world ki morning vachinatte.' },
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
  'A morning love note',
  'For my Num Num',
  'Good morning, beautiful',
  'A little love for today',
  'Your 9 AM reminder',
  'From my heart to yours',
  'Something soft for your morning',
  'You are so loved',
  'Before your day begins',
  'A note just because',
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
  'A little afternoon lift:',
  'Hey, beautiful, remember:',
  'A gentle pause for you:',
  'Midday note from my heart:',
  'For my hardworking love:',
  'In case today feels heavy:',
  'A small reminder, Num Num:',
  'Before the day runs away:',
  'A soft thought for you:',
  'Your afternoon love note:',
]

const ENCOURAGEMENTS = [
  'You are doing better than you think.',
  'Your quiet strength amazes me every day.',
  'One hard moment cannot define your whole day.',
  'You have everything you need for the next step.',
  'The care you give the world always matters.',
  'You can take this day one small step at a time.',
  'I believe in you, even on tiring days.',
  'Your best today is already more than enough.',
  'Your soft heart holds so much courage.',
  'Whatever comes next, you do not face it alone.',
]

const AFTERNOON_CLOSERS = [
  'I am cheering for you.',
  'You have my whole heart.',
  'Breathe; I am right here.',
  'Keep going gently, my love.',
  'I am so proud of you.',
  'Save some softness for you.',
  'We have got this together.',
  'Sending you the biggest hug.',
  'You are deeply loved.',
  'My love is always here.',
]

const AFTERNOON_TINGLISH_NOTES = [
  { title: 'Konchem break teesuko', body: 'Ela undi day, bangaram? Konchem break teesuko, anni okesari cheyyalsina avasaram ledu.' },
  { title: 'Water tagu, bujji', body: 'Busy ga unna sare, water tagu bujji. Nee gurinchi kuda konchem care teesuko.' },
  { title: 'Nenu nee pakkane unna', body: 'Ee roju konchem tough ga unda? Parledu, nenu nee pakkane unna.' },
  { title: 'Already chaala baaga', body: 'Half day aipoyindi Num Num. Nuvvu already chaala baaga chestunnav.' },
  { title: 'Oka deep breath', body: 'Oka deep breath teesuko bangaram. Migilina day ni slow ga handle cheddam.' },
  { title: 'Rest teesukunte chaalu', body: 'Nuvvu tired ayithe weak ani kaadu. Konchem rest teesukunte chaalu.' },
  { title: 'Nee effort chaalu', body: 'Afternoon reminder: nee best ante perfect kaadu, nee honest effort chaalu.' },
  { title: 'Na hug ready', body: 'Em jarigina sare, intiki vachaka na hug ready ga untundi.' },
  { title: 'Step by step, bujji', body: 'Bujji, overthink cheyyaku. Step by step vellina chaalu.' },
  { title: 'Naaku full nammakam', body: 'Nee meeda naaku full nammakam undi, especially neeku doubt vachinappudu.' },
  { title: 'Na favorite person', body: 'Day ela vellina sare, nuvvu na favorite person gaane untav.' },
  { title: 'Konchem smile cheyyi', body: 'Konchem smile cheyyi Num Num. Adi chusthe naaku kuda energy vastundi.' },
  { title: 'One thing at a time', body: 'Work pressure ekkuva unda? One thing at a time, bangaram.' },
  { title: 'Nuvvu alone kaadu', body: 'Ee afternoon lo oka small reminder: nuvvu alone kaadu.' },
  { title: 'Always strong avasaram ledu', body: 'Nuvvu chaala strong, kani eppudu strong gaane undalsina avasaram ledu.' },
  { title: 'Tea time ayinda?', body: 'Tea time ayinda? Oka sip teesukoni konchem na gurinchi alochinchu.' },
  { title: 'Naa love motham neeke', body: 'Migilina day peaceful ga vellali. Naa love motham neeke.' },
  { title: 'Slow avvadam okay', body: 'Tired ga unte slow avvu, adi give up chesinattu kaadu.' },
  { title: 'Ade chaala precious', body: 'Num Num, nuvvu try chestunnav kada, ade chaala precious.' },
  { title: 'Inko konchem, bangaram', body: 'Evening daggarlo undi bangaram. Inko konchem, tarvatha relax avvu.' },
]

export const afternoonNoteTitles = [
  'A little afternoon lift',
  'You have got this, my love',
  'A soft reminder for you',
  'From your biggest supporter',
  'A hug for the rest of today',
  'Keep going gently, beautiful',
  'Some love for your afternoon',
  'I believe in you',
  'For my strong Num Num',
  'Right here in your corner',
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
