import $ from 'jquery';
import BaseSection from './base';
import ProductCard from '../view/product/productCard';

const selectors = {
  cards: '[data-product-card] .product-card'
};

const classes = {
};

export default class ShopifyCollection extends BaseSection {
  constructor(container) {
    super(container, 'shopify-collection');

    this.$productCards = $(selectors.cards, this.$container);
    this.initProductCards();
  }

  initProductCards() {
    this.$productCards.each((i, card) => {
      new ProductCard(card);
    })
  }
}
