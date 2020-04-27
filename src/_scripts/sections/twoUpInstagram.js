import $ from 'jquery'; // eslint-disable-line no-unused-vars
import BaseSection from './base';

export default class TwoUpInstagram extends BaseSection {
  constructor(container) {
    super(container, 'two-up-instagram');

    this.$container = $(container);

    this.background = this.$container.data('background-color');

    this.observerProperties = {
      root: null,
      threshold: 0.4
    }

    this.IntersectionObserver = new IntersectionObserver(this.observerCallback.bind(this), this.observerProperties);
    this.IntersectionObserver.observe(this.$container.get(0));
  }

  observerCallback(entries, observer) {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0.4 && this.background !== '') {
        $('body').css('background-color', this.background);
      }
    })
  }
}
