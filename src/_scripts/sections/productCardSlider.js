import $ from 'jquery';
import Swiper, { Scrollbar, Navigation } from 'swiper';
import BaseSection from './base';

const selectors = {
  cardSlider: '[data-card-slider]',
  cards: '[data-card-slide]',
  scrollBar: '[data-scrollbar]',
};

export default class ProductCardSlider extends BaseSection {
  constructor(container) {
    super(container, 'productCardSlider');

    this.$cardSlider = $(selectors.cardSlider, this.$container);
    this.$cards = $(selectors.cards, this.$container);
    this.suffix = this.$cardSlider.data('slider-suffix') || '';
    this.$scrollBar = $(selectors.scrollBar, this.$container);
    this.initCardSlider();
  }

  initCardSlider() {
    const sliderSettings = {
      modules: [Scrollbar, Navigation],
      slidesPerView: 1.3,
      threshold: 20,
      spaceBetween: 20,
      watchOverflow: true,
      slidesOffsetBefore: 30,
      slidesOffsetAfter: 30,
      scrollbar: {
        el: this.$scrollBar.get(0),
        draggable: true,
      },
      navigation: {
        nextEl: '[data-slider-arrow-next]',
        prevEl: '[data-slider-arrow-prev]'
      },
      breakpoints: {
        530: {
          slidesPerView: 2.3,
          slidesOffsetBefore: 30,
          slidesOffsetAfter: 30,
        },
        992: {
          slidesPerView: 3.3,
          spaceBetween: 20,
          slidesOffsetBefore: 50,
          slidesOffsetAfter: 50,
        },
        1400: {
          slidesPerView: 4.3,
          slidesOffsetBefore: 50,
          slidesOffsetAfter: 50,
        }
      }
    }

    if(this.suffix === 'card-slider--pdp') {
      sliderSettings.slidesPerView = 1.15;
      sliderSettings.breakpoints = {};
    }

    this.cardSlider = new Swiper(this.$cardSlider.get(0), sliderSettings);
  }

  onBlockSelect(evt) {
    const $card = $(evt.target);

    this.cardSlider.slideTo($card.index());
  }
}
