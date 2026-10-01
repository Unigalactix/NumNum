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
        porcelain: 'rgb(var(--canvas-rgb) / <alpha-value>)',
        ink: 'rgb(var(--ink-rgb) / <alpha-value>)',
        muted: 'rgb(var(--muted-rgb) / <alpha-value>)',
        wine: 'rgb(var(--wine-rgb) / <alpha-value>)',
        sage: 'rgb(var(--sage-rgb) / <alpha-value>)',
        blush: 'rgb(var(--blush-rgb) / <alpha-value>)',
        petal: 'rgb(var(--petal-rgb) / <alpha-value>)',
        rose: 'rgb(var(--wine-rgb) / <alpha-value>)',
        lavender: 'rgb(var(--lavender-rgb) / <alpha-value>)',
        periwinkle: 'rgb(var(--muted-rgb) / <alpha-value>)',
        peach: 'rgb(var(--peach-rgb) / <alpha-value>)',
        mint: 'rgb(var(--mint-rgb) / <alpha-value>)',
        sky: 'rgb(var(--sky-rgb) / <alpha-value>)',
        cream: 'rgb(var(--surface-rgb) / <alpha-value>)',
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
