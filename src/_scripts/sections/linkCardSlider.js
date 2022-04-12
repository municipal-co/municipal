import $ from 'jquery'; // eslint-disable-line no-unused-vars
import Swiper from 'swiper';
import BaseSection from './base';

const selectors = {
  slider: '[data-slider]',
  slide: '[data-slide]'
};

export default class LinkCardSlider extends BaseSection {
  constructor(container) {
    super(container, 'footer');
    this.newsletterForm = $(selectors.newsletterForm, this.$container);

    this.$slider = $(selectors.slider, this.$container);
    this.$slides = $(selectors.slide, this.$container);

    this.initSliders();
  };

  initSliders() {
    this.slider = new Swiper(this.$slider, {
      slidesPerView: 1.3,
      spaceBetween: 20,
      slidesOffsetBefore: 30,
      slidesOffsetAfter: 30,
      freeMode: true,
      lazy: {
        enabled: true,
        loadPrevNext: true,
        loadPrevNextAmount: 2,
      },
      breakpoints: {
        530: {
          slidesPerView: 2.3,
        },
        992: {
          slidesPerView: 3.3,
          slidesOffsetBefore: 50,
          slidesOffsetAfter: 50,
        },
        1400: {
          slidesPerView: 4.3,
          slidesOffsetBefore: 50,
          slidesOffsetAfter: 50,
        }
      }
    });
  }

  onBlockSelect(evt) {
    this.slider.slideTo($(evt.target).index());
  }
}
