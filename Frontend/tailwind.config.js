/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '320px',
      },
      colors: {
        primary: '#252A61',
        secondary: '#B8C5FD',
        accent: '#E8C3D5',
      },
      fontFamily: {
        montserrat: ['Montserrat Alternates', 'sans-serif'],
      },
      boxShadow: {
        'custom': '0px 10px 20px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
