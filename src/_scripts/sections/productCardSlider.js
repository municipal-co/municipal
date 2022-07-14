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

    this.initCardSlider();
    this.initCards();
  }

  initCardSlider() {
    const sliderSettings = {
      slidesPerView: 1.2,
      threshold: 20,
      spaceBetween: 20,
      watchOverflow: true,
      slidesOffsetBefore: 30,
      slidesOffsetAfter: 30,
      breakpoints: {
        768: {
          slidesPerView: 2.3,
          slidesOffsetBefore: 30,
          slidesOffsetAfter: 30,
          spaceBetween: 20,
        },
        1100: {
          slidesPerView: 4.3,
          slidesOffsetBefore: 50,
          slidesOffsetAfter: 50,
        }
      }
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