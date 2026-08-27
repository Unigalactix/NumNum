Drop your photos here 💗

THE JIGSAW PUZZLE
- Save the paper-diorama picture as:  diorama.jpg  (in this folder)
- The "Piece Us Together" puzzle uses it automatically.
- If the file is missing, the puzzle falls back to soft gradient tiles.

PUSH NOTIFICATIONS
- Notification icons and category cards live in the  notifications/  subfolder.
- They are generated from diorama.jpg; do not edit those files by hand.
- After replacing diorama.jpg, run:  ./scripts/generate-notification-assets.ps1

STICKERS
- Chibi stickers go in the  stickers/  subfolder. See stickers/PROMPTS.txt
  for the exact filenames and ready-to-use image prompts.
- Individual transparent stickers and notification cards are generated from
  all 10 sheets. Do not edit the individual/ or notification/ folders by hand.
- After replacing a sheet, run:  ./scripts/extract-stickers.ps1

OTHER PHOTOS (optional)

To use real pictures in the games:
1. Copy image files into this folder, e.g. us-1.jpg, us-2.jpg
2. Open src/content.js and add the filenames to the `photos` array:
     photos: ['assets/us-1.jpg', 'assets/us-2.jpg']
3. The jigsaw puzzle will use the first photo automatically.

If you leave `photos` empty, cute emoji/gradient placeholders are used instead.
