import $ from 'jquery';
import BaseTemplate from './base';

const $body = $(document.body);
  
const selectors = {
  dot: '.dot'
};

class PageStylesTemplate extends BaseTemplate {
  constructor() {
    super('template-page-styles');
  }

  addEventHandlers() {
    $body.on('click', selectors.dot, function() {
      $(this).siblings().removeClass('is-active');
      $(this).addClass('is-active');
    });

    $(document).on('click', 'a[href="#"]', (e) => e.preventDefault());
  }
}

export default new PageStylesTemplate();
