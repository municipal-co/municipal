import $ from 'jquery'; // eslint-disable-line no-unused-vars
import Swiper from 'swiper';
import { throttle } from 'throttle-debounce';
import BaseSection from './base';

const $window = $(window);

const selectors = {
  slideshow: '.swiper-container',
  slide: '.swiper-slide',
  imageBlock: '[data-image-block]'
};

export default class ProductFeatures extends BaseSection {
  constructor(container) {
    super(container, 'product-features');

    this.$container = $(container);
    this.$slideshow = $(selectors.slideshow, this.$container);
    this.$slides = $(selectors.slide, this.$container);

    this.observerProperties = {
      root: null,
      threshold: 0.4
    }

    const swiperOptions = {
      loop: true,
      effect: 'fade',
      fadeEffect: {
        crossFade: true
      },
      speed: 500,
      pagination: {
        el: '.swiper-pagination',
        type: 'fraction',
      },
      scrollbar: {
        el: $('.swiper-scrollbar', this.$container),
        draggable: true,
      },
      navigation: {
        nextEl: $('.swiper-button-next', this.$container),
        prevEl: $('.swiper-button-prev', this.$container),
      }
    };

    this.IntersectionObserver = new IntersectionObserver(this.observerCallback.bind(this), this.observerProperties);
    this.IntersectionObserver.observe(this.$container.get(0));

    if (this.$slides.length > 1) {
      this.swiper = new Swiper(this.$slideshow, swiperOptions);
    }

    $window.on('resize', throttle(100, this.onResize.bind(this)));
    this.onResize();
  }

  observerCallback(entries, observer) {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0.4) {
        const event = $.Event('moduleInView', { selector: '#' + this.$container.attr('id') });

        $('body').trigger(event);
      }
    })
  }

  onResize() {
    const scrollbarPosition = $(selectors.imageBlock).outerHeight() + 70;
    const screenWidth = $(window).width();

    if (screenWidth < 992) {
      $('.swiper-scrollbar', this.$container).css('top', scrollbarPosition);
    }
  }
}
