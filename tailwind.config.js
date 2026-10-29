/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Map Tailwind color utilities to CSS variables
        // These will resolve to the CSS variables defined in index.css
        'system-blue': 'var(--system-blue)',
        'system-green': 'var(--system-green)',
        'system-indigo': 'var(--system-indigo)',
        'system-orange': 'var(--system-orange)',
        'system-pink': 'var(--system-pink)',
        'system-purple': 'var(--system-purple)',
        'system-red': 'var(--system-red)',
        'system-teal': 'var(--system-teal)',
        'system-yellow': 'var(--system-yellow)',
        'system-gray': 'var(--system-gray)',
        'system-gray2': 'var(--system-gray2)',
        'system-gray3': 'var(--system-gray3)',
        'system-gray4': 'var(--system-gray4)',
        'system-gray5': 'var(--system-gray5)',
        'system-gray6': 'var(--system-gray6)',

        // Semantic Colors (adapt to dark mode via CSS variables)
        'label-primary': 'var(--label-primary)',
        'label-secondary': 'var(--label-secondary)',
        'label-tertiary': 'var(--label-tertiary)',
        'label-quaternary': 'var(--label-quaternary)',

        'fill-primary': 'var(--fill-primary)',
        'fill-secondary': 'var(--fill-secondary)',
        'fill-tertiary': 'var(--fill-tertiary)',
        'fill-quaternary': 'var(--fill-quaternary)',

        'separator-opaque': 'var(--separator-opaque)',
        'separator-non-opaque': 'var(--separator-non-opaque)',

        'system-background': 'var(--system-background)',
        'secondary-system-background': 'var(--secondary-system-background)',
        'tertiary-system-background': 'var(--tertiary-system-background)',
        'system-grouped-background': 'var(--system-grouped-background)',
        'secondary-system-grouped-background': 'var(--secondary-system-grouped-background)',
        'tertiary-system-grouped-background': 'var(--tertiary-system-grouped-background)',

        // Semantic Status Colors
        'success': 'var(--success)',
        'warning': 'var(--warning)',
        'error': 'var(--error)',
        'info': 'var(--info)',

        // Placeholder Text
        'placeholder-text': 'var(--placeholder-text)',
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