import $ from 'jquery';
import Swiper from 'swiper';
import BaseSection from './base';

const selectors = {
  slideshow: '[data-slideshow]',
  slide: '[data-slide]',
}

export default class ContentSlider extends BaseSection {
  constructor(container) {
    super(container, 'content-slider');
    this.$slideshow = $(selectors.slideshow, this.$container);
    this.$slides = $(selectors.slide, this.$slideshow);

    this.sliderSettings = {
      slidesToShow: 1,
      autoplay: false,
      autoHeight: true,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      effect: 'fade',
      fadeEffect: {
        crossFade: true
      },
      threshold: 40,
      loop: true,
    }

    if(this.$slides.length > 1) {
      this.initSliders();
    }
  }

  initSliders() {
    this.Slideshow = new Swiper(this.$slideshow, this.sliderSettings);
  }


}
