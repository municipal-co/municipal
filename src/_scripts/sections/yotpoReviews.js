import $ from 'jquery'; // eslint-disable-line no-unused-vars
import BaseSection from './base';

export default class YotpoReviews extends BaseSection {
  constructor(container) {
    super(container, 'yotpo-reviews');

    this.$container = $(container);
    this.background = this.$container.data('background-color');
    this.observerProperties = {
      root: null,
      threshold: 0.1
    }

    this.IntersectionObserver = new IntersectionObserver(this.observerCallback.bind(this), this.observerProperties);
    this.IntersectionObserver.observe(this.$container.get(0));

    console.log("asdasdasd");
  }

  observerCallback(entries, observer) {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0.1 && this.background !== '') {
        $('body').css('background-color', this.background);
      }
    })
  }
}
