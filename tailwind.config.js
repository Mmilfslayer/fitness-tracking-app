/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Apple System Colors - Light Mode
        'system-blue': '#007AFF',
        'system-green': '#34C759',
        'system-indigo': '#5856D6',
        'system-orange': '#FF9F0A',
        'system-pink': '#FF2D55',
        'system-purple': '#AF52DE',
        'system-red': '#FF3B30',
        'system-teal': '#5AC8FA',
        'system-yellow': '#FFCC00',
        'system-gray': '#8E8E93',
        'system-gray2': '#AEAEB2',
        'system-gray3': '#C7C7CC',
        'system-gray4': '#D1D1D6',
        'system-gray5': '#E5E5EA',
        'system-gray6': '#F2F2F7',

        // Semantic Colors (adapt to dark mode)
        'label-primary': '#000000',
        'label-secondary': '#3C3C43',
        'label-tertiary': '#3C3C4399',
        'label-quaternary': '#3C3C434D',

        'fill-primary': '#0000001A',
        'fill-secondary': '#0000000D',
        'fill-tertiary': '#00000033',
        'fill-quaternary': '#00000014',

        'separator-opaque': '#C6C6C8',
        'separator-non-opaque': '#3C3C434D',

        'system-background': '#FFFFFF',
        'secondary-system-background': '#F2F2F7',
        'tertiary-system-background': '#FFFFFF',
        'system-grouped-background': '#F2F2F7',
        'secondary-system-grouped-background': '#FFFFFF',
        'tertiary-system-grouped-background': '#F2F2F7',

        // Dark Mode overrides
        dark: {
          'label-primary': '#FFFFFF',
          'label-secondary': '#EBEBF5',
          'label-tertiary': '#EBEBF599',
          'label-quaternary': '#EBEBF54D',

          'fill-primary': '#FFFFFF1A',
          'fill-secondary': '#FFFFFF0D',
          'fill-tertiary': '#FFFFFF33',
          'fill-quaternary': '#FFFFFF14',

          'separator-opaque': '#38383A',
          'separator-non-opaque': '#54545880',

          'system-background': '#000000',
          'secondary-system-background': '#1C1C1E',
          'tertiary-system-background': '#2C2C2E',
          'system-grouped-background': '#000000',
          'secondary-system-grouped-background': '#1C1C1E',
          'tertiary-system-grouped-background': '#2C2C2E',

          'system-blue': '#0A84FF',
          'system-green': '#30D158',
          'system-indigo': '#5E5CE6',
          'system-orange': '#FF9F0A',
          'system-pink': '#FF375F',
          'system-purple': '#BF5AF2',
          'system-red': '#FF453A',
          'system-teal': '#64D2FF',
          'system-yellow': '#FFD60A',
          'system-gray': '#8E8E93',
          'system-gray2': '#636366',
          'system-gray3': '#48484A',
          'system-gray4': '#3A3A3C',
          'system-gray5': '#2C2C2E',
          'system-gray6': '#1C1C1E',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        rounded: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Rounded"',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'sans-serif'
        ],
        mono: [
          'SF Mono',
          'Monaco',
          'Inconsolata',
          '"Fira Mono"',
          '"Droid Sans Mono"',
          'monospace'
        ]
      },
      fontSize: {
        'large-title': ['34px', { lineHeight: '41px', letterSpacing: '0.37px', fontWeight: '400' }],
        'title-1': ['28px', { lineHeight: '34px', letterSpacing: '0.36px', fontWeight: '400' }],
        'title-2': ['22px', { lineHeight: '28px', letterSpacing: '0.35px', fontWeight: '400' }],
        'title-3': ['20px', { lineHeight: '25px', letterSpacing: '0.38px', fontWeight: '400' }],
        'headline': ['17px', { lineHeight: '22px', letterSpacing: '-0.43px', fontWeight: '600' }],
        'body': ['17px', { lineHeight: '22px', letterSpacing: '-0.43px', fontWeight: '400' }],
        'callout': ['16px', { lineHeight: '21px', letterSpacing: '-0.32px', fontWeight: '400' }],
        'subhead': ['15px', { lineHeight: '20px', letterSpacing: '-0.24px', fontWeight: '400' }],
        'footnote': ['13px', { lineHeight: '18px', letterSpacing: '-0.08px', fontWeight: '400' }],
        'caption-1': ['12px', { lineHeight: '16px', letterSpacing: '0px', fontWeight: '400' }],
        'caption-2': ['11px', { lineHeight: '13px', letterSpacing: '0.07px', fontWeight: '400' }]
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px'
      },
      borderRadius: {
        'apple-sm': '6px',
        'apple-md': '8px',
        'apple-lg': '12px',
        'apple-xl': '16px',
        'apple-2xl': '22px',
        'apple-full': '9999px'
      },
      boxShadow: {
        'apple-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'apple-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'apple-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'apple-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'apple-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'
      },
      animation: {
        'apple-spring': 'apple-spring 0.5s cubic-bezier(0.17, 0.67, 0.5, 1)',
        'apple-ease-in-out': 'apple-ease-in-out 0.25s cubic-bezier(0.42, 0, 0.58, 1)',
        'apple-ease-out': 'apple-ease-out 0.3s cubic-bezier(0, 0, 0.2, 1)',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.17, 0.67, 0.5, 1)',
        'slide-down': 'slide-down 0.3s cubic-bezier(0.42, 0, 0.58, 1)',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.17, 0.67, 0.5, 1)'
      },
      keyframes: {
        'apple-spring': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'apple-ease-in-out': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'apple-ease-out': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },
      transitionTimingFunction: {
        'apple-spring': 'cubic-bezier(0.17, 0.67, 0.5, 1)',
        'apple-ease': 'cubic-bezier(0.42, 0, 0.58, 1)',
        'apple-ease-out': 'cubic-bezier(0, 0, 0.2, 1)'
      },
      transitionDuration: {
        'apple-fast': '150ms',
        'apple-normal': '250ms',
        'apple-slow': '350ms'
      }
    }
  },
  plugins: []
}