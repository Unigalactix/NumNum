const OPENERS = [
  'Good morning, my love.',
  'Morning, beautiful.',
  'Wake up, my favorite person.',
  'A little morning note for you:',
  'Good morning, Num Num.',
  'Before the day gets busy, remember:',
  'Hello, sleepyhead.',
  'Today begins with one happy truth:',
  'A soft reminder for your morning:',
  'The sun is up, and so is my heart.',
]

const THOUGHTS = [
  'You make ordinary days feel quietly extraordinary.',
  'The world feels gentler because you are in mine.',
  'Your smile is still my favorite way to start a day.',
  'You are loved fully, calmly, and without conditions.',
  'My heart keeps choosing you in every little moment.',
  'You bring warmth to places you do not even notice.',
  'I am so grateful our stories found each other.',
  'You deserve every kind thing this day can bring.',
  'Even a busy day cannot make you less wonderful.',
  'Being yours is one of the happiest parts of being me.',
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

export const loveNotes = OPENERS.flatMap((opener) =>
  THOUGHTS.flatMap((thought) =>
    CLOSERS.map((closer) => `${opener} ${thought} ${closer}`),
  ),
)

export function loveNoteForDay(dayNumber) {
  const index = Math.abs(dayNumber) % loveNotes.length
  return {
    body: loveNotes[index],
    index,
    title: loveNoteTitles[index % loveNoteTitles.length],
  }
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
  'Sending you a soft thought:',
  'Your afternoon love note:',
]

const ENCOURAGEMENTS = [
  'You are doing better than you think.',
  'Your quiet strength amazes me every day.',
  'One hard moment cannot define your whole day.',
  'You have everything you need for the next step.',
  'The care you give the world always matters.',
  'You can take this day one small step at a time.',
  'I believe in you, especially on the tiring days.',
  'Your best today is already more than enough.',
  'There is so much courage inside your soft heart.',
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
  'Come back to my love anytime.',
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

export const afternoonNotes = AFTERNOON_OPENERS.flatMap((opener) =>
  ENCOURAGEMENTS.flatMap((encouragement) =>
    AFTERNOON_CLOSERS.map((closer) => `${opener} ${encouragement} ${closer}`),
  ),
)

export function afternoonNoteForDay(dayNumber) {
  const index = Math.abs(dayNumber * 37 + 17) % afternoonNotes.length
  return {
    body: afternoonNotes[index],
    index,
    title: afternoonNoteTitles[index % afternoonNoteTitles.length],
  }
}
