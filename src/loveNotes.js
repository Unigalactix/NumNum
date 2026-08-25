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
