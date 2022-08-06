import gulp from 'gulp';
const { src, dest, task } = gulp;
import flatten from 'gulp-flatten';

const files = (cb) => {
  return new Promise((resolve, reject) => {
    const folders = ['layout', 'templates', 'sections', 'snippets', 'assets', 'locales', 'config'];

    folders.forEach((folder) => {
      if(folder == 'templates') {
        src(`src/${folder}/**/*`)
        .pipe(dest(`dist/${folder}`));
      } else {
        src(`src/${folder}/**/*`)
        .pipe(flatten())
        .pipe(dest(`dist/${folder}`));
      }
    });

    resolve();
  });
};

export default files;