import gulp from 'gulp';
const { src, dest, task } = gulp;
import postcss from 'gulp-postcss';
import sourcemaps from 'gulp-sourcemaps';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import size from 'gulp-size';

const sass = gulpSass(dartSass);

// Postcss plugins
import purgecss from '@fullhuman/postcss-purgecss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import defaultPreset from 'cssnano-preset-default';

const styles = () => {
  const postCssPlugins = [
    purgecss({
      content: ['src/**/*.liquid', 'src/_scripts/**/*.js'],
      enabled: true,
      safelist: {
      greedy: [/swiper/, /yotpo/, /product-reviews/, /findify/, /shopify-challenge__container/],
      },
    }),
    cssnano({
      preset: defaultPreset(),
      plugins: [autoprefixer],
    })
  ]

  return src(['src/_styles/theme.scss', 'src/_styles/checkout.scss'])
  .pipe(sourcemaps.init())
  .pipe(sass())
  .pipe(postcss(postCssPlugins))
  .pipe(sourcemaps.write('.'))
  .pipe(size({showFiles: true, title:'Syles: Size of file: '}))
  .pipe(dest('dist/assets/'));
};

export default styles;