import $ from 'jquery';
import BaseSection from './base';
import ProductCard from '../view/product/productCard';
import ScrollSnapSlider from '../managers/scrollSnapSlider';

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
    this.initCards();
  }

  initCardSlider() {
    this.cardSlider = new ScrollSnapSlider(this.$container.get(0), {
      enableArrows: true,
      prevArrow: '[data-card-slider-arrow-prev]',
      nextArrow: '[data-card-slider-arrow-next]'
    });
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
