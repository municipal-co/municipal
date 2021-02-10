import $ from 'jquery'; // eslint-disable-line no-unused-vars
import BaseSection from './base';

const selectors = {
  pencilBanner: '[data-pencil-banner]',
  marqueeContentContainer: '[data-marquee-content-container]'
};

export default class PencilBannerSection extends BaseSection {
  constructor(container) {
    super(container, 'pencilBanner');

    this.$container = $(container);

    $(selectors.pencilBanner, this.$container).on('click mouseenter mouseleave', this.onTouch.bind(this));
  }

  onTouch(e) {
    const $marqueeContentContainer = $(selectors.marqueeContentContainer, this.$container);
    if (!$marqueeContentContainer.hasClass('marquee-paused')) {
      $marqueeContentContainer.addClass('marquee-paused');
    } else {
      $marqueeContentContainer.removeClass('marquee-paused');
    }    
  }
}
