/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#facc15',
        neutral: '#f3f4f6'
      }
    }
  },
  plugins: []
}
