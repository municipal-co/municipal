import $ from 'jquery';
import BaseSection from './base';
import CollectionFilters from '../view/collection/collectionFilters';
import CollectionSort from '../view/collection/collectionSort';

const selectors = {
  collectionJson: '[data-collection-json]',
  promoCard: '.promo_card'
};

export default class CollectionSection extends BaseSection {
  constructor(container) {
    super(container, 'collection');

    // Stop parsing if we don't have the collection json script tag
    if (!$(selectors.collectionJson, this.$container).html()) {
      console.warn(`[${this.name}] - Element matching ${selectors.collectionJson} required.`);
      return;
    }
    this.collectionSections = $('.collection-section', this.$container);
    this.background = this.$container.data('background-color');
    this.observerProperties = {
      root: null,
      threshold: 0.1
    }

    self = this;

    this.collectionSections.each(function() {
      self.IntersectionObserver = new IntersectionObserver(self.observerCallback.bind(self), self.observerProperties);
      self.IntersectionObserver.observe(this);
    });

    this.collectionData = JSON.parse($(selectors.collectionJson, this.$container).html());
    this.promoCard = $(selectors.promoCard, this.$container);

    this.filters = new CollectionFilters(container, this.collectionData);
    this.sort = new CollectionSort(container, this.collectionData);

    if (this.promoCard.length) {
      $(window).on("scroll", this.onWindowScroll.bind(this));
    }
  }

  onWindowScroll(e) {
    var rotate = $(window).scrollTop() / 10;
    $('.promo_card__image', this.promoCard).css({ transform: 'rotate(-' + rotate + 'deg)' });
  }

  observerCallback(entries, observer) {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0.1 && this.background !== '') {
        $('body').css('background-color', this.background);
      }
    })
  }
}
