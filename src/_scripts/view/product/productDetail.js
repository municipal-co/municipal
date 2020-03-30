import $ from 'jquery';
import ProductDetailForm from './productDetailForm';
import ProductDetailGalleries from './productDetailGalleries';

const selectors = {
  productDetailForm: '[data-product-detail-form]',
  productDetailGalleries: '[data-product-detail-galleries]'
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

    this.$pdg = $(selectors.productDetailGalleries, this.$el);
    this.$pdf = $(selectors.productDetailForm, this.$el);
    
    this.galleries = new ProductDetailGalleries({
      $container: this.$pdg
    });

    this.form = new ProductDetailForm({
      $container: this.$pdf,
      onVariantChange: this.onVariantChange.bind(this),
      enableHistoryState: enableHistoryState
    });
  }

  onVariantChange(variant) {
    this.galleries.updateForVariant(variant);
  }
}
