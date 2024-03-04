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
import tailwind from 'tailwindcss';
import tailwindConfig from '../../tailwind.config.js';

const styles = () => {
  const postCssPlugins = [
    // purgecss({
    //   content: ['src/**/*.liquid', 'src/_scripts/**/*.js'],
    //   enabled: true,
    //   safelist: {
    //     greedy: [/swiper/, /yotpo/, /product-reviews/, /findify/, /shopify-challenge__container/, /chosen/],
    //   },
    // }),
    tailwind(tailwindConfig),
    autoprefixer,
    cssnano({
      preset: defaultPreset(),
    }),
  ]

  return src(['src/_styles/theme.scss', 'src/_styles/checkout.scss'])
  .pipe(sass())
  .pipe(postcss(postCssPlugins))
  .pipe(size({showFiles: true, title:'[Styles] Size of file: '}))
  .pipe(dest('dist/assets/'));
};

export default styles;