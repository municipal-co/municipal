import $ from 'jquery';
import Swiper, { Pagination, EffectFade } from 'swiper';
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
      modules: [ Pagination, EffectFade ],
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
      threshold: 20,
      loop: true,
    }

    if(this.$slides.length > 1) {
      this.initSliders();
    }
  }

  initSliders() {
    this.Slideshow = new Swiper(this.$slideshow.get(0), this.sliderSettings);
  }


}
