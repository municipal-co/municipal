import $ from 'jquery';
import Swiper, { Navigation } from 'swiper';
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
      modules: [Navigation],
      slidesPerView: 'auto',
      slide: selectors.slide,
      navigation: {
        nextEl: selectors.nextArrow,
        prevEl: selectors.prevArrow,
      },
      spaceBetween: 10,
      slidesOffsetBefore: 20,
      slidesOffsetAfter: 20,
      threshold: 20,
      watchOverflow: true,
      centerInsufficientSlides: true,
      observer: true,
      breakpoints: {
        992: {
          slidesOffsetAfter: 40,
          slidesOffsetBefore: 40,
        }
      }
    })
  }

  onBlockSelect(e) {

  }

  onBlockDeselect(e) {

  }
}
