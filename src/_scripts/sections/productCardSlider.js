import $ from 'jquery';
import Swiper from 'swiper';
import BaseSection from './base';
import ProductCard from '../view/product/productCard';

const selectors = {
  cardSlider: '[data-card-slider]',
  cards: '[data-card-slide]',
};

export default class ProductCardSlider extends BaseSection {
  constructor(container) {
    super(container, 'productCardSlider');

    this.$cardSlider = $(selectors.cardSlider, this.$container);
    this.$cards = $(selectors.cards, this.$container);
    this.suffix = this.$cardSlider.data('slider-suffix') || '';

    this.initCardSlider();
    this.initCards();
  }

  initCardSlider() {
    const sliderSettings = {
      slidesPerView: 1.3,
      threshold: 20,
      spaceBetween: 20,
      watchOverflow: true,
      slidesOffsetBefore: 30,
      slidesOffsetAfter: 30,
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

    if(this.suffix === 'pdp') {
      sliderSettings.slidesPerView = 1.8;
      sliderSettings.breakpoints = {};
    }

    this.cardSlider = new Swiper(this.$cardSlider.get(0), sliderSettings);
  }

  initCards() {
    this.$cards.each((i, card) => {
      new ProductCard(card)
    })
  }

  onBlockSelect(evt) {
    const $card = $(evt.target);

    this.cardSlider.slideTo($card.index());
  }
}