import $ from 'jquery';
import Swiper from 'swiper';
import BaseSection from './base';

const selectors = {
  slideshow: '[data-slideshow]'
};

export default class SlideshowSection extends BaseSection {
  constructor(container) {
    super(container, 'slideshow');

    this.$slideshow = $(selectors.slideshow, this.$container);

    const swiperOptions = {
      loop: true,
      speed: 500,
      slidesPerView: Number.parseInt(this.$slideshow.data('slides-to-show')) || 1,
      slidesPerGroup: Number.parseInt(this.$slideshow.data('slides-to-scroll')) || 1,
      navigation: {
        nextEl: this.$slideshow.find('.arrow--right').get(0),
        prevEl: this.$slideshow.find('.arrow--left').get(0)
      }
    };

    if (this.$slideshow.data('autoplay')) {
      swiperOptions.autoplay = {
        delay: Number.parseInt(this.$slideshow.data('speed')) || 5000
      };
    }

    if (this.$slideshow.data('dots') && this.$slideshow.find('.swiper-pagination').length) {
      swiperOptions.pagination = {
        el: this.$slideshow.find('.swiper-pagination'),
        type: 'bullets',
        clickable: true
      };
    }

    if (this.$slideshow.data('animation') === 'fade') {
      swiperOptions.effect = 'fade';
      swiperOptions.fadeEffect = {
        crossFade: true
      };
    }

    this.swiper = new Swiper(this.$slideshow.get(0), swiperOptions);
  }

  /**
   * Theme Editor section events below
   */
  onBlockSelect(e) {
    const $blockSlide = this.$slideshow.find(`[data-block-id="${e.detail.blockId}"]`);

    if ($blockSlide.length === 0) {
      return;
    }

    this.swiper.slideToLoop($blockSlide.first().data('swiper-slide-index'));
    this.swiper.autoplay.stop();
  }

  onBlockDeselect(e) {
    if (this.$slideshow.data('autoplay')) {
      this.swiper.autoplay.start();
    }
  }
}
