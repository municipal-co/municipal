import $ from 'jquery'; // eslint-disable-line no-unused-vars
import BaseSection from './base';

const selectors = {
  marqueeContentContainer: '[data-marquee-content-container]'
};

export default class PencilBannerSection extends BaseSection {
  constructor(container) {
    super(container, 'pencilBanner');

    this.$container = $(container);
    this.$container.on('touchstart touchend mouseenter mouseleave', this.onTouch.bind(this));

  }

  onTouch(e) {  
    if (e.type == 'touchstart' || e.type =='mounseenter') {
      $(selectors.marqueeContentContainer, this.$container).addClass('marquee-paused');
    } else {
      $(selectors.marqueeContentContainer, this.$container).removeClass('marquee-paused');
    }
  }
}
