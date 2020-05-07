import $ from 'jquery'; // eslint-disable-line no-unused-vars
import Swiper from 'swiper';
import { throttle } from 'throttle-debounce';
import * as Breakpoints from '../core/breakpoints';
import BaseSection from './base';

const $window = $(window);

const selectors = {
  slideshow: '.swiper-container',
  slide: '.swiper-slide'
};

export default class CompleteTheLook extends BaseSection {
  constructor(container) {
    super(container, 'complete-the-look');

    this.$container = $(container);
    this.$slideshow = $(selectors.slideshow, this.$container);
    this.$slides = $(selectors.slide, this.$container);

    this.swiperOptions = {
      loop: false,
      slidesPerView: 2.3,
      scrollbar: {
        el: $('.swiper-scrollbar', this.$container),
        draggable: true,
      }
    };

    $window.on('resize', throttle(100, this.onResize.bind(this)));
    this.onResize();
  }

  onResize() {
    const screenWidth = $(window).width();
    const breakpointMinWidth = Breakpoints.getBreakpointMinWidth('md');

    if (screenWidth <= breakpointMinWidth) {
      this.swiper = new Swiper(this.$slideshow, this.swiperOptions);
    } else if ( screenWidth >= breakpointMinWidth && this.$slideshow.hasClass('swiper-container-initialized')){
      $('.swiper-wrapper', this.$slideshow).css('transform', 'none');
      this.swiper.destroy();
    }
  }
}
