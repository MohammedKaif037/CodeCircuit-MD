/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bungee: ['Bungee', 'sans-serif'],
        'press-start': ['"Press Start 2P"', 'cursive'],
      },
      colors: {
        cyberpink: '#ff77e9',
        cyberblue: '#1e3a8a',
        cybershadow: '#1e40af',
        cybercyan: '#67e8f9',
        cyberpurple: '#f0abfc',
      },
      boxShadow: {
        'cyber': '4px 4px 0 #1e40af',
        'cyber-lg': '8px 8px 0 #1e40af',
      },
      animation: {
        'vhs-flicker': 'flicker 0.5s infinite alternate',
        'text-glitch': 'glitch 2s linear infinite',
      },
      keyframes: {
        flicker: {
          '0%': { opacity: '0.9' },
          '100%': { opacity: '1' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-3px, 3px)' },
          '40%': { transform: 'translate(-3px, -3px)' },
          '60%': { transform: 'translate(3px, 3px)' },
          '80%': { transform: 'translate(3px, -3px)' },
          '100%': { transform: 'translate(0)' },
        }
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.cyberblue'),
            h1: {
              color: theme('colors.cyberpurple'),
              fontFamily: theme('fontFamily.bungee'),
              marginBottom: '0.75em',
            },
            h2: {
              color: theme('colors.cyberpink'),
              fontFamily: theme('fontFamily.bungee'),
              marginBottom: '0.5em',
            },
            h3: {
              color: theme('colors.cybercyan'),
              fontFamily: theme('fontFamily.bungee'),
            },
            strong: {
              color: theme('colors.cyberpink'),
            },
            a: {
              color: theme('colors.cybercyan'),
              textDecoration: 'none',
              '&:hover': {
                color: theme('colors.cyberpurple'),
                textDecoration: 'underline',
              },
            },
            code: {
              color: theme('colors.cyberpink'),
              backgroundColor: theme('colors.pink.50'),
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '500',
            },
            pre: {
              backgroundColor: theme('colors.pink.50'),
              borderWidth: '2px',
              borderColor: theme('colors.black'),
              boxShadow: theme('boxShadow.cyber'),
            },
            blockquote: {
              borderLeftColor: theme('colors.cybercyan'),
              color: theme('colors.cyberblue'),
              fontStyle: 'normal',
              backgroundColor: theme('colors.pink.50'),
              padding: '0.5em 1em',
            },
            ul: {
              li: {
                '&:before': {
                  backgroundColor: theme('colors.cyberpink'),
                },
              },
            },
            ol: {
              li: {
                '&:before': {
                  color: theme('colors.cyberpink'),
                },
              },
            },
          },
        },
      }),
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
