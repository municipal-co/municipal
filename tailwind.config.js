/** @type {import('tailwindcss').Config} */

// eslint-disable-file
export default {
  content: ['./src/**/*.liquid', './src/_scripts/**/*.js'],
  theme: {
    container: {
      center: true,
      padding: '20px',
    },
    extend: {
      maxWidth: {
        layout: '1376px',
      },
      colors: {
        'black': '#121212',
        'bg-white': '#f5f5f6',
        'gray': '#b1b17c2',
        'core-gray-1': '#f1f1f1',
        'core-gray-2': '#b1b7c2',
        'core-gray-3': '#393d49',
        'account-gray': '#979797',
        'arrow-gray': '#b8b8b8',
        'brownish-red': '#752c2e',
        'green': '#00ff00',
        'cyan': '#009dcc',
        'yellow': '#ffea06',
        'blue': '#0036eb',
        'red': '#ff2b00',
        'tan': '#c3baa8',
        'brown': '#452b2b',
      },
      fontSize: {
        'display': [
          '115px',
          {
            lineHeight: '0.87em',
          }
        ],
        'display-m': [
          '40px',
          {
            lineHeight: '0.975em'
          }
        ],
        'h1': [
          '100px',
          {
            lineHeight: '1.03em',
          }
        ],
        'h1-m': [
          '32px',
          {
            lineHeight: '1.063em'
          }
        ],
        'h2': [
          '60px',
          {
            lineHeight: '0.917em',
          }
        ],
        'h2-m': [
          '32px',
          {
            lineHeight: '1.063em'
          }
        ],
        'h3': [
          '40px',
          {
            lineHeight: '1.125em',
          }
        ],
        'h3-m': [
          '21px',
          {
            lineHeight: '1.19em'
          }
        ],
        'h4': [
          '30px',
          {
            lineHeight: '1.1em',
          }
        ],
        'h4-m': [
          '17px',
          {
            lineHeight: '1.176em'
          }
        ],
        'h5': [
          '25px',
          {
            lineHeight: '1em',
          }
        ],
        'h5-m': [
          '15px',
          {
            lineHeight: '1.33em'
          }
        ],
        'h6': [
          '18px',
          {
            lineHeight: '1em',
          }
        ],
        'h6-m': [
          '12px',
          {
            lineHeight: '1.167em'
          }
        ],
        'p1': [
          '54px',
          {
            lineHeight: '1.296em',
          }
        ],
        'p1-m': [
          '27px',
          {
            lineHeight: '1.148em'
          }
        ],
        'p2': [
          '46px',
          {
            lineHeight: '1.13em',
          }
        ],
        'p2-m': [
          '24px',
          {
            lineHeight: '1.208em'
          }
        ],
        'p3': [
          '36px',
          {
            lineHeight: '1.222em',
          }
        ],
        'p3-m': [
          '20px',
          {
            lineHeight: '1.2em'
          }
        ],
        'p4': [
          '26px',
          {
            lineHeight: '1.154em',
          }
        ],
        'p4-m': [
          '18px',
          {
            lineHeight: '1.2em'
          }
        ],
        'p5': [
          '20px',
          {
            lineHeight: '1.667em',
          }
        ],
        'p5-m': [
          '15px',
          {
            lineHeight: '1.2em'
          }
        ],
        'p6': [
          '18px',
          {
            lineHeight: '1.389em',
          }
        ],
        'p6-m': [
          '13px',
          {
            lineHeight: '1.154em'
          }
        ],
      },
      fontFamily: {
        'sequel-roman': ['Sequel\\ Sans\\ Roman', 'sans-serif'],
        'sequel-medium': ['Sequel\\ Sans\\ Medium', 'sans-serif'],
        'sequel-semi': ['Sequel\\ Sans\\ SemiBold', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      keyframes: {
        'fade-pulse': {
          '0%, 100%': { opacit: 1 },
          '50%': { opacity: 0 }
        }
      },
      animation: {
        'fade-pulse': 'fade-pulse 2s infinite',
      },
    },
  },
  plugins: [],
};

