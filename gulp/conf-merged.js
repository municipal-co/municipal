import gulp from 'gulp';
import path from 'path';
import log from 'fancy-log';
import themekit from '@shopify/themekit';
import readConfig from 'read-config';
import cheerio from 'gulp-cheerio';
import { deleteAsync } from 'del';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import webpack from 'webpack';
import yargs from 'yargs';
import gulpExtReplace from 'gulp-ext-replace';
import flatten from 'gulp-flatten';
import postcss from 'gulp-postcss';
import sourcemaps from 'gulp-sourcemaps';
import * as url from 'url';

// Postcss plugins
import purgecss from '@fullhuman/postcss-purgecss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

const argv = yargs(process.argv.slice('2')).argv;
const { series, parallel, src, dest, task } = gulp;
const sass = gulpSass(dartSass);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const themeConfig = readConfig('./config.yml');

const webpackConfig = {
  entry: {
    theme: path.resolve(__dirname, '/src/_scripts/theme.js'),
    vendor: path.resolve(__dirname, '/src/_scripts/vendor.js'),
    checkout: path.resolve(__dirname, '/src/_scripts/checkout.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist/'),
    filename: 'assets/[name].js'
  },
  resolve: {
    alias: {
      'handlebars' : 'handlebars/dist/handlebars.js'
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      "$": "jquery",
      "jQuery": "jquery",
      'window.jQuery': 'jquery',
      'window.$': 'jquery'
    })
  ],
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: "babel-loader",
        }],
        resolve: {
          fullySpecified: false,
        }
      },
    ]
  }
}

task('scripts', () => {
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (err, stats) => {
      if(err) {
        log(err);
      }
      if (stats.hasErrors()) {
        log(new Error(stats.compilation.errors.join('\n')));
      }
      resolve();
    });
  });
});

task('themeFiles', (cb) => {
  return new Promise((resolve, reject) => {
    const folders = ['layout', 'templates', 'sections', 'snippets', 'assets', 'locales', 'config'];

    folders.forEach((folder) => {
      if(folder == 'templates') {
        src(`src/${folder}/**/*`)
        .pipe(dest(`dist/${folder}`));
      } else {
        src(`src/${folder}/**.*`)
        .pipe(flatten())
        .pipe(dest(`dist/${folder}`));
      }
    });

    resolve();
  });
});

task('styles', () => {
  const postCssPlugins = [
    purgecss({
      content: ['src/**/*.liquid', 'src/_scripts/**/*.js'],
      enabled: true,
      safelist: {
        greedy: [/swiper/, /yotpo/, /chosen/],
      },
    }),
    cssnano({
      preset: 'advanced',
      plugins: [autoprefixer],
    })
  ]

  return src(`src/_styles/theme.scss`)
  .pipe(sourcemaps.init())
  .pipe(sass())
  .pipe(postcss(postCssPlugins))
  .pipe(sourcemaps.write('.'))
  .pipe(dest('./dist/assets/'))
})

const processSvg = ($, file) => {
  const $svg = $('svg');
  const $newSvg = $('<svg aria-hidden="true" focusable="false" role="presentation" class="icon" />');
  const fileName = file.relative.replace('.svg', '');
  const viewBoxAttr = $svg.attr('viewbox');

  // Add necessary attributes
  if (viewBoxAttr) {
    const width = parseInt(viewBoxAttr.split(' ')[2], 10);
    const height = parseInt(viewBoxAttr.split(' ')[3], 10);
    const widthToHeightRatio = width / height;
    if (widthToHeightRatio >= 1.5) {
      $newSvg.addClass('icon--wide');
    }
    $newSvg.attr('viewBox', viewBoxAttr);
  }

  // Add required classes to full color icons
  if (file.relative.indexOf('-full-color') >= 0) {
    $newSvg.addClass('icon--full-color');
  }

  $newSvg.addClass(fileName).append($svg.contents());

  $newSvg.append($svg.contents());
  $svg.after($newSvg);
  $svg.remove();
}

task('icons', () => {
  return src('./src/icons/*.svg')
  .pipe(cheerio(processSvg))
  .pipe(gulpExtReplace('.liquid'))
  .pipe(dest('./dist/snippets/'))
})

task('clear', () => {
  return deleteAsync('dist/**', {force: true});
})

task('tk_deploy', () => {
  return new Promise(async (resolve, reject) => {
    let config;
    let env_length = 1;

    if(typeof argv.environment == 'string' || typeof argv.e == 'string') {
      config = themeConfig[argv.e || argv.environment[0] || "development" ]
    } else {
      config = themeConfig[argv.e[0] || argv.environment[0]];
      env_length = argv.e.length;
    }

    if(typeof config == 'undefined') {
      reject('No development environment was found, check your config.yml has at least one "development" environment');
    }

    if(argv.mode === 'full') {
      log('Full mode detected');
      log('Downloading Setting and Template files from live theme');
      try {
        await themekit.command('download', {
          password: config.password,
          store: config.store,
          live: true,
          noIgnore: true,
          dir: 'dist/',
          files: ['config/settings_data.json', 'templates/*.json'],
          'no-theme-kit-access-notifier': true
        })
      } catch (error) {
        log.error('An error ocurred when downloading live theme settings');
        reject(error);
      }
    }

    log('Start upload files upload to environment(s)');

    for(let i=0; i < env_length; i++) {
      try {
        await themekit.command('deploy', {
          env: env_length == 1 ? argv.environment || argv.e : argv.e[i] || argv.environment[i],
          dir: 'dist/',
          noIgnore: argv.mode == 'full',
          files: typeof argv.files == 'string' ? [argv.files] : argv.files || '',
          'no-theme-kit-access-notifier': true
        })
      } catch (error) {
        reject(error);
      }
    }

    resolve();
  })

})

task('watch', (done) => {
  return new Promise(async (resolve, reject) => {
    gulp.watch(['src/templates/**/*', 'src/snippets/*', 'src/sections/*', 'src/layout/*', 'src/config/*', 'src/locales/*'], series('themeFiles'));
    gulp.watch(['./src/_styles/**/*.scss', './src/_styles/**/*.css'], series('styles'))
    gulp.watch('./src/_scripts/**/*.js', series('scripts'));
    gulp.watch('./src/icons/**/*', series('icons'));

    if(!argv.open == true) {
      try{
        await themekit.command('open', {
          env: argv.e || argv.environment || 'development'
        })
      } catch (error) {
        reject(error);
      }
    }

    try {
      await themekit.command('watch', {
        env: argv.e || argv.environment || 'development',
        dir: 'dist/',
        notify: './deploy.log',
        "no-theme-kit-access-notifier": true
      })
    } catch (error) {
      reject(error);
    }

    resolve();
  })
})
task('build', series('clear', 'styles', 'scripts', 'themeFiles', 'icons'));
task('deploy', series( 'build', 'tk_deploy' ));

