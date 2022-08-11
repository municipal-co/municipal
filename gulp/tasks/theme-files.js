import gulp from 'gulp';
const { src, dest } = gulp;
import flatten from 'gulp-flatten';
import mergeStream from 'merge-stream'

const files = (cb) => {
  const folders = ['layout', 'templates', 'sections', 'snippets', 'assets', 'locales', 'config'];

  const streamMap = folders.map((folder) => {
    if(folder == 'templates') {
      return src(`src/${folder}/**/*`)
      .pipe(dest(`dist/${folder}`))
    } else {
      return src(`src/${folder}/**/*`)
      .pipe(flatten())
      .pipe(dest(`dist/${folder}`))
    }
  });

  return mergeStream(streamMap);

};

export default files;