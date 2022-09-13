import gulp from 'gulp';
import size from 'gulp-size';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import babelify from 'babelify';
import log from 'fancy-log';
import mergeStream from 'merge-stream';
import yargs from 'yargs';

const {dest} = gulp;
const argv = yargs(process.argv.slice('2')).argv;

const browserifyThis = (file) => {

  const config = Object.assign({}, {debug:false, entries:file.source, entryName: file.name})

  log(`Bundling ${file.name}`);
  const bundle = () => {
    return b.bundle()
      .on('error', (error) => {
        log.error(error);
      })
      .pipe(source(file.name))
      .pipe(dest('./dist/assets/'))
      .pipe(size({showFiles: true, title: 'Size of file:'}))
  }

  let b = browserify(config)
    .transform(babelify, {
    presets: ['@babel/preset-env', '@babel/preset-react'],
    ignore: [
      "./node_modules/",
      "../../node_modules"
    ]
  })

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

  return mergeStream(files.map((file) => {
    return browserifyThis(file);
  }));

}

export default scripts;