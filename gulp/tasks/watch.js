const config = require('../config');
const gulp = require('gulp');
const path = require('path');
const watch = require('gulp-watch');

gulp.task('watch', () => {
  Object.keys(config.tasks).forEach((taskName) => {
    const task = config.tasks[taskName];
    let filePattern;
    if (task.filePattern) {
      filePattern = task.filePattern;
    } else {
      filePattern = path.join(config.root.src, task.src, '**/*.{' + task.extensions.join(',') + '}');
    }
    watch(filePattern, () => {
      gulp.start(task.watchTask || taskName);
    });
  });
});
