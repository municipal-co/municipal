import $ from 'jquery'; // eslint-disable-line no-unused-vars
import Swiper from 'swiper';
import { throttle } from 'throttle-debounce';
import BaseSection from './base';

const $window = $(window);

const selectors = {
  slideshow: '.swiper-container',
  slide: '.swiper-slide'
};

export default class ProductFeatures extends BaseSection {
  constructor(container) {
    super(container, 'product-features');

    this.$container = $(container);
    this.background = this.$container.data('background-color');
    this.$slideshow = $(selectors.slideshow, this.$container);
    this.$slides = $(selectors.slide, this.$container);

    this.observerProperties = {
      root: null,
      threshold: 0.4
    }

    const swiperOptions = {
      loop: false,
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
      $('.product-features-inner-container', this.$container).on('mouseenter', this.onSlideshowEnter.bind(this));
      $('.product-features-inner-container', this.$container).on('mouseleave', this.onSlideshowLeave.bind(this));
    }

    $window.on('resize', throttle(100, this.onResize.bind(this)));
    this.onResize();
  }

  observerCallback(entries, observer) {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0.4 && this.background !== '') {
        $('body').css('background-color', this.background);
        const event = $.Event('updateCurrentModule', { selector: '#' + this.$container.attr('id') });

        $('body').trigger(event);
      }
    })
  }

  onSlideshowEnter(e) {
    e.preventDefault();
    $('.swiper-button', this.$container).addClass('visible');
  }

  onSlideshowLeave(e) {
    e.preventDefault();
    $('.swiper-button', this.$container).removeClass('visible');
  }

  onResize() {
    const scrollbarPosition = $('.features-title-wrapper').height() + $('.feature-slide__image').height() + 16;
    const screenWidth = $(window).width();

    if (screenWidth < 992) {
      $('.swiper-scrollbar', this.$container).css('top', scrollbarPosition);
    }
  }
}
