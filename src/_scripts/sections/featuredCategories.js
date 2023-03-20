import $ from 'jquery';
import ScrollSnapSlider from '../managers/scrollSnapSlider';
// import Swiper, { Navigation } from 'swiper';
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
    this.slider = new ScrollSnapSlider(this.$container.get(0), {
        enableArrows: true,
        disableScrollbar: true,
        nextArrow: '[data-arrow-next]',
        prevArrow: '[data-arrow-prev]',
      }
    )
  }

  onBlockSelect(e) {

  }

  onBlockDeselect(e) {

  }
}
