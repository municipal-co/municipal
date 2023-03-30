import $ from 'jquery';
import ScrollSnapSlider from '../managers/scrollSnapSlider';
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
        slidesPerView: 'auto',
        paddingBefore: '20px',
        paddingAfter: '20px',
        nextArrow: '[data-arrow-next]',
        prevArrow: '[data-arrow-prev]',
        breakpoints: {
          992: {
            slidesPerView: 'auto',
            paddingBefore: '40px',
            paddingAfter: '40px',
          }
        }
      }
    )
  }

  onBlockSelect(e) {

  }

  onBlockDeselect(e) {

  }
}
