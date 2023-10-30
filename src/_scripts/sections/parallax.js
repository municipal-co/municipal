import $ from 'jquery';
import { jarallax } from 'jarallax';
import BaseSection from './base';

const selectors = {
  wrapper: '[data-parallax]',
  bgDesktop: '[data-parallax-bg-desktop]',
  bgMobile: '[data-parallax-bg-mobile]',
};

export default class parallax extends BaseSection {
  constructor(container) {
    super(container, 'parallax');

    this.$wrapper = $(selectors.wrapper, this.$container);
    this.$bgDesktop = $(selectors.bgDesktop, this.$container);
    this.$bgMobile = $(selectors.bgMobile, this.$container);

    this.state = {
      isMobile: false,
      bgDesktop: this.$bgDesktop.data('parallax-bg-desktop'),
      bgMobile: this.$bgDesktop.data('parallax-bg-mobile'),
    };

    if (this.$bgDesktop.length || this.$bgMobile.length) {
      this.matchMedia = window.matchMedia('(max-width: 992px)');
      this.matchMedia.addEventListener(
        'change',
        this.onBreakpointChange.bind(this)
      );
      this.matchMedia.addEventListener(
        'DOMContentLoaded',
        this.onBreakpointChange.bind(this)
      );

      this.onBreakpointChange(this.matchMedia);
    }
  }

  onBreakpointChange(evt) {
    if (evt.matches) {
      this.state.isMobile = true;
      this.$bgMobile.addClass('jarallax-img');
      this.$bgDesktop.removeClass('jarallax-img');
    } else {
      this.state.isMobile = false;
      this.$bgMobile.removeClass('jarallax-img');
      this.$bgDesktop.addClass('jarallax-img');
    }
    if (this.Parallax !== undefined) {
      this.destroyParallax();
    }
    this.initParallax();
  }

  initParallax() {
    const $el = this.$wrapper;
    this.Parallax = jarallax($el[0], {
      speed: 0.3,
      onInit: function () {
        $el.addClass('is-initialized');
      },
    });
  }

  destroyParallax() {
    jarallax(this.$wrapper[0], 'destroy');
  }
}
