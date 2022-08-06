import gulp from 'gulp';
import size from 'gulp-size';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import babelify from 'babelify';
import watchify from 'watchify';
import log from 'fancy-log';
import mergeStream from 'merge-stream';
import yargs from 'yargs';

const {dest} = gulp;
const argv = yargs(process.argv.slice('2')).argv;
const browserifyThis = (file) => {

  const config = Object.assign({}, watchify.args, {debug:false, entries:file.source, entryName: file.name})

  log(`Bundling ${file.name}`);
  const bundle = () => {
       b.bundle()
      .on('error', (error) => {
        log.error(error);
      })
      .on('file', () => {

      })
      .pipe(source(file.name))
      .pipe(dest('./dist/assets/'))
      .pipe(size({showFiles: true, title: 'Size of file:'}))
      .on('finish', () => {
        log(`Bundled ${file.name}`)
      })
  }

  let b = browserify(config)
      .transform(babelify, {
      presets: ['@babel/preset-env'],
      ignore: [
        "./node_modules/",
        "../../node_modules"
      ]
    })
    .transform('browserify-shim', { global:true });

    if(argv._ === 'bundle' || argv._ === 'deploy'){
      b = watchify(b);

      b.on('update', bundle);
    }

  return bundle();

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

  return mergeStream.apply(files.map((file) => {
    browserifyThis(file);
  }));

}

export default scripts;