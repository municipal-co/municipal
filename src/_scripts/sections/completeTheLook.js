import $ from 'jquery'; // eslint-disable-line no-unused-vars
import Swiper from 'swiper';
import { throttle } from 'throttle-debounce';
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
    this.background = this.$container.data('background-color');
    this.$slideshow = $(selectors.slideshow, this.$container);
    this.$slides = $(selectors.slide, this.$container);

    this.observerProperties = {
      root: null,
      threshold: 0.4
    }

    this.swiperOptions = {
      loop: false,
      slidesPerView: 2,
      scrollbar: {
        el: $('.swiper-scrollbar', this.$container),
        draggable: true,
      }
    };

    this.IntersectionObserver = new IntersectionObserver(this.observerCallback.bind(this), this.observerProperties);
    this.IntersectionObserver.observe(this.$container.get(0));

    $window.on('resize', throttle(100, this.onResize.bind(this)));
    this.onResize();
  }

  observerCallback(entries, observer) {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0.4 && this.background !== '') {
        $('body').css('background-color', this.background);
      }
    })
  }

  onResize() {
    var screenWidth = $(window).width();

    if (screenWidth < 992) {
      this.swiper = new Swiper(this.$slideshow, this.swiperOptions);
    } else if ( screenWidth >= 992 && this.$slideshow.hasClass('swiper-container-initialized')){
      this.swiper.destroy();
    }
  }
}
