import gulp from 'gulp';
const { src, dest, task } = gulp;
import cheerio from 'gulp-cheerio';
import gulpExtReplace from 'gulp-ext-replace';

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

const icons = () => {
  return src('./src/icons/*.svg')
    .pipe(cheerio(processSvg))
    .pipe(gulpExtReplace('.liquid'))
    .pipe(dest('./dist/snippets/'))
};

export default icons;