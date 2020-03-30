const gulp = require('gulp');
const gulpStylelint = require('gulp-stylelint');
const config = require('../config');

gulp.task('stylelint', () => {
  return gulp
    .src(config.tasks.styles.filePattern)
    .pipe(gulpStylelint({
      reporters: [
        { formatter: 'string', console: true }
      ]
    }));
});
