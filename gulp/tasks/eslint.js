const gulp = require('gulp');
const eslint = require('gulp-eslint');
const config = require('../config');

gulp.task('eslint', () => {
  return gulp.src(config.tasks.eslint.filePattern)
    .pipe(eslint('.eslintrc'))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});
