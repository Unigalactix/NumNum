/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        script: ['"Dancing Script"', 'cursive'],
        display: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        porcelain: '#f8f6f4',
        ink: '#272126',
        muted: '#746c71',
        wine: '#8f4058',
        sage: '#71867a',
        blush: '#f1dce2',
        petal: '#e7bcc8',
        rose: '#9b4d63',
        lavender: '#e8e2e7',
        periwinkle: '#765d6d',
        peach: '#efd8d0',
        mint: '#dce8e1',
        sky: '#dfe8eb',
        cream: '#fbfaf9',
      },
      boxShadow: {
        soft: '0 18px 48px -28px rgba(55, 37, 46, 0.32)',
        glow: '0 12px 28px -18px rgba(143, 64, 88, 0.45)',
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-16px) rotate(6deg)' },
        },
        pop: {
          '0%': { transform: 'scale(0.7)', opacity: '0' },
          '70%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggle: {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        floaty: 'floaty 5s ease-in-out infinite',
        pop: 'pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        wiggle: 'wiggle 0.6s ease-in-out infinite',
        shimmer: 'shimmer 8s ease infinite',
      },
    },
  },
  plugins: [],
}
