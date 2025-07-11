/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}", 
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Dark Green Theme Palette
        'dark-primary': '#001711',     // Primary dark background
        'dark-secondary': '#003030',   // Secondary dark elements
        'accent-green': '#58E886',     // Bright accent color
        'text-light': '#D8DEE9',       // Light text on dark backgrounds
        'text-contrast': '#ECEFF4',    // High contrast text
        
        // Legacy color names (keeping for compatibility)
        'dark-green': '#001711',
        'green': '#003030',
        'light-green': '#58E886',
        'whitish': '#D8DEE9',
        'white': '#ECEFF4',
      },
      backgroundColor: {
        'app-primary': '#001711',
        'app-secondary': '#003030',
        'app-accent': '#58E886',
      },
      textColor: {
        'app-primary': '#58E886',
        'app-secondary': '#D8DEE9',
        'app-contrast': '#ECEFF4',
      },
      borderColor: {
        'app-accent': '#58E886',
        'app-secondary': '#003030',
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
} 