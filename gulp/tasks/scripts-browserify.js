import gulp from 'gulp';
import size from 'gulp-size';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import babelify from 'babelify';
import babel from 'gulp-babel';
import log from 'fancy-log';
import mergeStream from 'merge-stream';
import yargs from 'yargs';
import watchify from 'watchify';
import terser from 'gulp-terser';
import buffer from 'vinyl-buffer';
import browserifyShim from 'browserify-shim';
import aliasify from 'aliasify';
import gulpIf from 'gulp-if';
import sourcemaps from 'gulp-sourcemaps';

const { dest } = gulp;

const argv = yargs(process.argv.slice('2')).argv;
const productionMode = process.env.NODE_ENV === 'production' || argv.e === 'production' || argv.environment === 'production';

const browserifyThis = (file) => {

  const config = {
    debug: true,
    entries: file.source,
    cache: {},
    packageCache: {},
    plugin: [watchify]
  };

  log(`Bundling ${file.name}`);
  const bundle = (bundler) => {
    return bundler.bundle()
      .on('error', function(error) {
        log.error(error.message);
        this.emit('end');
      })
      .pipe(source(file.name))
      .pipe(buffer())
      .pipe(gulpIf(!productionMode, sourcemaps.init({loadMaps: true})))
      .pipe(babel({
        presets: [
          ['@babel/preset-env'],
          '@babel/preset-react'
        ],
        plugins: [
          ['@babel/plugin-transform-runtime', { regenerator: true }]
        ]
      }))
      .pipe(size({ showFiles: true, title: 'Size of file:' }))
      .pipe(gulpIf(!productionMode, sourcemaps.write('.')))
      .pipe(dest('./dist/assets/'))
      .pipe(gulpIf(productionMode, terser({
        output: {
          comments: false
        }
      })))
      .pipe(gulpIf(productionMode, size({ showFiles: true, title: 'Size of minified file:' })))
      .pipe(gulpIf(productionMode, dest('./dist/assets/')))
  }

  const bundler = browserify(config)
    .transform(babelify, {
      presets: ['@babel/preset-env', '@babel/preset-react'],
      global: true,
      exclude: ['//node_modules/(?!@findify/)/'],
      plugins: [['@babel/plugin-transform-runtime', { regenerator: true }]],
    })
    .transform(aliasify, {
      presets: ['@babel/preset-env'],
      global: true,
      aliases: {
        react: 'preact/compat',
        'react-dom': 'preact/compat',
      },
    })
    .plugin(browserifyShim, { global: true });



  bundler.on('update', () => bundle(bundler));

  return bundle(bundler);

}

const scripts = () => {
  const files = [
    {
      name: 'theme.js',
      source: './src/_scripts/theme.js',
    },
    {
      name: 'vendor.js',
      source: './src/_scripts/vendor.js',
    },
    {
      name: 'checkout.js',
      source: './src/_scripts/checkout.js',
    }
  ];

  return mergeStream(files.map((file) => {
    return browserifyThis(file);
  }));

}

export default scripts;
