import $ from 'jquery';
import * as Currency from '../../core/currency';
import ProductDetailForm from './productDetailForm';
import ProductGallery from './productDetailGalleries';

const selectors = {
  productDetailForm: '[data-product-detail-form]',
  productGallery: '[data-product-gallery]',
  stickyPrice: '[data-sticky-image] [data-product-price]',
  stickyComparePrice: '[data-sticky-image] [data-compare-price]'
};

export default class ProductDetail {
  /**
   * ProductDetail constructor
   *
   *
   * @param {jQuery | HTMLElement} el - Main element, see snippets/product-detail.liquid
   * @param {Boolean} enableHistoryState - enables URL history updates on variant change.  See productDetailForm.js
   */
  constructor(el, enableHistoryState = true) {
    this.settings = {};
    this.name = 'productDetail';

    this.$el = $(el);

    if (!this.$el || this.$el === undefined) {
      console.warn(`[${this.name}] - $el required to initialize`);
      return;
    }

    this.$productDetailGallery = document.querySelector(selectors.productGallery);

    this.$pdf = $(selectors.productDetailForm, this.$el);

    this.gallery = new ProductGallery(this.$productDetailGallery);

    this.form = new ProductDetailForm({
      $container: this.$pdf,
      onVariantChange: this.onVariantChange.bind(this),
      enableHistoryState: enableHistoryState,
      lowQuantityThreshold: this.$pdf.data('low-quantity-threshold'),
    });
  }

  onVariantChange(variant) {
    this.gallery.onVariantChange(variant);
    if(variant) {
      $(selectors.stickyPrice).show();
      if(variant.compare_at_price > variant.price) {
        $(selectors.stickyComparePrice).text(Currency.formatMoney(variant.compare_at_price, window.moneyFormat).replace('.00', '')).removeClass('hide');
      } else {
        $(selectors.stickyComparePrice).addClass('hide').text('');
      }

      $(selectors.stickyPrice).text(Currency.formatMoney(variant.price, window.moneyFormat).replace('.00', ''))
    } else {
      $(selectors.stickyPrice).hide();
    }

  }
}
