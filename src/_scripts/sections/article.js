import $ from 'jquery';
import BaseSection from './base';

const selectors = {
  articleContentWrapper: '[data-article-content-wrapper]',
  articleContent: '[data-article-content]'
};

const classes = {
  contentWrapperReady: 'is-ready',
  paragraphImagesOnly: 'images-only'
};

export default class ArticleSection extends BaseSection {
  constructor(container) {
    super(container, 'article');

    this.$articleContentWrapper = $(selectors.articleContentWrapper, this.$container);
    this.$articleContent = $(selectors.articleContent, this.$container);

    // Use this constructor to make any needed adjustments to the article content before displaying to the user
    // The example below adds a class to any article.content paragraphs that contain *only* image tags
    // Feel free to delete
    this.$articleContent.find('p').each((i, p) => {
      const $p = $(p);
      const $c = $p.children();

      if ($c.length > 0 && $c.length === $c.filter('img').length) {
        $p.addClass(classes.paragraphImagesOnly);
      }
    });

    // Also wrap any bare images that are direct children
    this.$articleContent.find(' > img').wrap(`<p class="${classes.paragraphImagesOnly}"></p>`);

    this.$articleContentWrapper.addClass(classes.contentWrapperReady);
  }
}
