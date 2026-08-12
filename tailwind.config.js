/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        script: ['"Dancing Script"', 'cursive'],
        sans: ['Quicksand', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        blush: '#ffd6e8',
        petal: '#ffb3d1',
        rose: '#ff8fb1',
        lavender: '#e6d4ff',
        periwinkle: '#c9b8ff',
        peach: '#ffe0c7',
        mint: '#c4f5e9',
        sky: '#c9e6ff',
        cream: '#fff6fa',
      },
      boxShadow: {
        soft: '0 10px 40px -10px rgba(255, 143, 177, 0.45)',
        glow: '0 0 30px rgba(255, 179, 209, 0.7)',
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
