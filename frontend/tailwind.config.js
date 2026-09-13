/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mining: {
          950: '#0b0f19',
          900: '#0f172a',
          850: '#151f38',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          amber: '#f59e0b',
          gold: '#eab308',
          teal: '#06b6d4',
          emerald: '#10b981',
          danger: '#ef4444'
        }
      }
    },
  },
  plugins: [],
}
