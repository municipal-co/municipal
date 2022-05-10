import $ from 'jquery';
import Swiper from 'swiper';
import BaseSection from './base';

const selectors = {
  slider: '[data-slideshow]',
  slide: '[data-slide]',
  nextArrow: '[data-arrow-next]',
  prevArrow: '[data-arrow-prev]',
};

export default class HeaderSection extends BaseSection {
  constructor(container) {
    super(container, 'header');
    this.$slider = $(selectors.slider, this.$container);

    this.initSlider();
  }

  initSlider() {
    this.slider = new Swiper(this.$slider.get(0), {
      slidesPerView: 'auto',
      slide: selectors.slide,
      navigation: {
        nextEl: selectors.nextArrow,
        prevEl: selectors.prevArrow,
      },
      spaceBetween: 20,
      slidesOffsetBefore: 40,
      slidesOffsetAfter: 40,
      threshold: 20,
      watchOverflow: true,
    })
  }

  onBlockSelect(e) {

  }

  onBlockDeselect(e) {

  }
}
