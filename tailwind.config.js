/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // Indigo 600
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F3F4F6', // Gray 100
          foreground: '#1F2937', // Gray 800
        },
        background: '#FFFFFF',
        foreground: '#1F2937', // Gray 800
        muted: {
          DEFAULT: '#F3F4F6',
          foreground: '#6B7280',
        },
        accent: {
          DEFAULT: '#EEF2FF', // Indigo 50
          foreground: '#4F46E5',
        },
      },
    },
  },
  plugins: [],
}
