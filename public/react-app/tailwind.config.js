/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#c58b3a',
        coral: '#e8a070',
        navy: '#1e3a5f',
        green: '#287d68',
        blue: '#3b82f6',
        purple: '#8b5cf6',
      },
    },
  },
  plugins: [],
}
