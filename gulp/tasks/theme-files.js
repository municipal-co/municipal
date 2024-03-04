import gulp from 'gulp';
const { src, dest } = gulp;
import flatten from 'gulp-flatten';
import mergeStream from 'merge-stream'
import changed from 'gulp-changed';

const files = (cb) => {
  const folders = ['layout', 'templates', 'sections', 'snippets', 'assets', 'locales', 'config'];

  const streamMap = folders.map((folder) => {
    if(folder == 'templates') {
      return src(`src/${folder}/**/*`)
      .pipe(changed(`dist/${folder}`))
      .pipe(dest(`dist/${folder}`))
    } else {
      return src(`src/${folder}/**/*`)
      .pipe(changed(`dist/${folder}`))
      .pipe(flatten())
      .pipe(dest(`dist/${folder}`))
    }
  });

  return mergeStream(streamMap);

};

export default files;