/** @type {import('tailwindcss').Config} */

// eslint-disable-file
export default {
  content: ['./src/**/*.liquid', './src/_scripts/**/*.js'],
  theme: {
    extend: {
      colors: {
        'black': '#121212',
        'gray': '#424446',
        'core-gray-1': '#f1f1f1',
        'core-gray-2': '#b1b7c2',
        'core-gray-3': '#393d49',
        'account-gray': '#979797',
        'arrow-gray': '#b8b8b8',
        'brownish-red': '#752c2e',
        'bg-white': '#f5f5f5',
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
          '140px',
          {
            lineHeight: '120px',
          }
        ],
        'display-m': [
          '40px',
          {
            lineHeight: '38px'
          }
        ],
        'h1': [
          '100px',
          {
            lineHeight: '95px',
          }
        ],
        'h1-m': [
          '32px',
          {
            lineHeight: '1em'
          }
        ],
        'h2': [
          '60px',
          {
            lineHeight: '55px',
          }
        ],
        'h2-m': [
          '20px',
          {
            lineHeight: '1em'
          }
        ],
        'h3': [
          '40px',
          {
            lineHeight: '1em',
          }
        ],
        'h3-m': [
          '15px',
          {
            lineHeight: '1em'
          }
        ],
        'h4': [
          '30px',
          {
            lineHeight: '33px',
          }
        ],
        'h4-m': [
          '12px',
          {
            lineHeight: '1em'
          }
        ],
        'h5': [
          '25px',
          {
            lineHeight: '1em',
          }
        ],
        'h5-m': [
          '10px',
          {
            lineHeight: '10px'
          }
        ],
        'h6': [
          '18px',
          {
            lineHeight: '1em',
          }
        ],
        'h6-m': [
          '8px',
          {
            lineHeight: '1em'
          }
        ],
        'p1': [
          '54px',
          {
            lineHeight: '1.296em',
          }
        ],
        'p1-m': [
          '20px',
          {
            lineHeight: '1.2em'
          }
        ],
        'p2': [
          '46px',
          {
            lineHeight: '1.13em',
          }
        ],
        'p2-m': [
          '17px',
          {
            lineHeight: '1.294em'
          }
        ],
        'p3': [
          '36px',
          {
            lineHeight: '1.222em',
          }
        ],
        'p3-m': [
          '14px',
          {
            lineHeight: '1.357em'
          }
        ],
        'p4': [
          '20px',
          {
            lineHeight: '1.35em',
          }
        ],
        'p4-m': [
          '11px',
          {
            lineHeight: '1.455em'
          }
        ],
        'p5': [
          '15px',
          {
            lineHeight: '1.667em',
          }
        ],
        'p5-m': [
          '10px',
          {
            lineHeight: '1.5'
          }
        ],
        'p6': [
          '12px',
          {
            lineHeight: '1.583em',
          }
        ],
        'p6-m': [
          '9px',
          {
            lineHeight: '1.529em'
          }
        ],
        'container': {
          center: true,
          padding: '20px',
        }
      },
    },
  },
  plugins: [],
};

