import gulp from 'gulp';
import log from 'fancy-log';
import themekit from '@shopify/themekit';
import readConfig from 'read-config';
import { deleteAsync } from 'del';
import yargs from 'yargs';
import browserSync from 'browser-sync';

// Import tasks
import styles from './gulp/tasks/styles.js.js'
import icons from './gulp/tasks/icons.js.js'
import files from './gulp/tasks/theme-files.js.js'
// import scripts from './gulp/tasks/scripts-webpack.js'
import scripts from './gulp/tasks/scripts-browserify.js.js'
// import browserSync from './gulp/tasks/browser-sync.js'


const argv = yargs(process.argv.slice('2')).argv;
const { series, task, watch } = gulp;
const themeConfig = readConfig('./config.yml');

task('clear', () => {
  return deleteAsync('dist/**', {force: true});
})

task('tk_deploy', () => {
  return new Promise(async (resolve, reject) => {
    let config;
    let env_length = 1;

    if(typeof argv.environment == 'string' || typeof argv.e == 'string') {
      config = themeConfig[argv.e || argv.environment]
    } else if(argv.e || argv.environment) {
      config = themeConfig[argv.e[0] || argv.environment[0]];
      env_length = argv.e.length;
    } else {
      config = themeConfig['development']
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
          'no-theme-kit-access-notifier': true,
        })
      } catch (error) {
        reject(error);
      }
    }

    resolve();
  })
})

task('styles', styles);
task('scripts', async () => {
  await scripts();
});
task('files', files);
task('icons', icons);

task('liveReload', (end) => {
  let config;

  if(typeof argv.environment == 'string' || typeof argv.e == 'string') {
    config = themeConfig[argv.e || argv.environment]
  } else if(argv.e || argv.environment) {
    config = themeConfig[argv.e[0] || argv.environment[0]];
    env_length = argv.e.length;
  } else {
    config = themeConfig['development']
  }

  if(typeof config == 'undefined') {
    reject('No development environment was found, check your config.yml has at least one "development" environment');
  }
  console.log(config);
  browserSync.init({
    files: ['./deploy.log'],
    proxy: `https://${config.store}/?preview_theme_id=${config.theme_id}`
  })

  end();
})

task('watch', () => {
  return new Promise( async(resolve, reject) => {

    let config;

    if(typeof argv.environment == 'string' || typeof argv.e == 'string') {
      config = themeConfig[argv.e || argv.environment];
    } else {
      config = themeConfig['development'];
    }

    if(typeof config == 'undefined') {
      reject('No development environment was found, check your config.yml has at least one "development" environment');
    }

    watch(['src/templates/**/*', 'src/snippets/*', 'src/sections/*', 'src/layout/*', 'src/config/*', 'src/locales/*'], series("files"));
    watch(['./src/_styles/**/*.scss', './src/_styles/**/*.css'], series("styles"))
    watch('./src/_scripts/**/*.js', series("scripts"));
    watch('./src/icons/**/*', series("icons"));

    browserSync.init({
      open: 'tunnel',
      files: ['./deploy.log'],
      proxy: {
        target: `https://${config.store}/?preview_theme_id=${config.theme_id}`,
        middleware: (req, res, next) => {
          const prefix = req.url.indexOf('?') > -1 ? '&' : '?';
          req.url += prefix + '_fd=0';
          next();
        }
      },
    })

    try {
      await themekit.command('watch', {
        env: argv.e || argv.environment || 'development',
        dir: 'dist/',
        notify: './deploy.log',
        'no-theme-kit-access-notifier': true,
      })
    } catch (error) {
      reject(error);
    }

    resolve();
  })
})

task('build', series("scripts", "styles"));
// task('build', series('clear', "styles", "scripts", "files", "icons"));
task('deploy', series( 'build', 'tk_deploy' ));

