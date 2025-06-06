/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        slateUltraDark: '#1F1F28',
        charcoalDeep: '#1A1A23',
        slateDark: '#2A2A3B',
        accentBlue: '#3B82F6',
        accentEmerald: '#10B981',
        accentRed: '#EF4444',
        accentAmber: '#F59E0B',
        textPrimary: '#E0E0E0',
        textSecondary: '#C0C0D0',
        textMuted: '#A0A0B5',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 