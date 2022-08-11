import purgecss from '@fullhuman/postcss-purgecss';

module.exports = {
  plugins: [
    purgecss({
      content: ['./src/**/*.liquid', './src/**/*.js']
    }),
    require('autoprefixer')('last 2 versions'),
    require('cssnano')({preset:'default'}),
  ]
}