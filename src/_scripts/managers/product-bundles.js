import $ from 'jquery';
import * as imageUtils from '../core/image';

const selectors = {
  bundleOptionsContainer: '[data-bundle-options-container]',
  bundleOption: '[data-bundle-quantity-option]',
  bundleProductsContainer: '[data-bundle-products-container]',
  bundleProduct: '[data-bundle-product]',
  bundleItemId: '[data-bundle-product-id]',
  bundleProductImage: '[data-bundle-product-image]',
  bundleVariantOptions: '[data-variant-options]',
  bundleProductId: '[data-bundle-product-id]',
  bundleProductSoldout: '[data-bundle-product-sold-out-badge]',
  productAddToCart: '[data-add-to-cart]',
  klarnaMessagingPrice: '[data-purchase-amount]',
  bundleDiscountPrice: '[data-bundle-discount-price]',
  bundleFullPrice: '[data-bundle-full-price]',
}

const classes = {
  visible: 'is-visible',
  optionsDisabled: 'bundle__options-container--disabled'
}

export default class ProductBundles {
  constructor($container) {
    this.name = 'productBundlesManager';
    this.namespace = `.${this.name}`;
    this.$container = $container;

    this.$bundleOptions = $(selectors.bundleOption, this.$container);
    this.$bundleProductsContainer = $(selectors.bundleProductsContainer, this.$container);
    this.$bundleProducts = $(selectors.bundleProduct, this.$container);

    this.$bundleOptions.on('change', this.onBundleOptionChange.bind(this));
    this.$bundleProducts.on('change', this.onProductSelectedChange.bind(this));

    $(selectors.bundleOptionsContainer).removeClass(classes.optionsDisabled);
  }

  onBundleOptionChange(evt) {
    const $this = $(evt.currentTarget);
    const selectedQty = $this.val();

    this.updateKlarnaPrice($this.parent());

    if(selectedQty > 1) {
      this.$bundleProductsContainer.show();
      this.$bundleProducts.first().prop('checked', true);
      this.$bundleProducts.each((index, el) => {
        const $productParent = $(el).parent();
        if(index + 1 <= selectedQty) {
          $productParent.addClass(classes.visible);
        } else {
          $productParent.removeClass(classes.visible);
        }
      })
    } else {
      this.$bundleProductsContainer.hide();
      this.$bundleProducts.prop('checked', false);
    }
  }

  updateKlarnaPrice($container) {

    if(typeof $container === 'undefined') {
      this.$bundleOptions.each((index, el) => {
        if($(el).is(':checked')) {
          $container = $(el).parent();
        }
      })
    }

    let klarnaPrice = 0;
    const $klarnaMessaging = $(selectors.klarnaMessagingPrice, this.$container);
    const $bundleDiscountPrice = $(selectors.bundleDiscountPrice, $container);
    const $bundleFullPrice = $(selectors.bundleFullPrice, $container);
    if($bundleDiscountPrice.length) {
      klarnaPrice = $bundleDiscountPrice.data('bundle-discount-price');
    } else {
      klarnaPrice = $bundleFullPrice.data('bundle-full-price');
    }

    if($klarnaMessaging.length > 0) {
      $klarnaMessaging.attr('data-purchase-amount', klarnaPrice);
      window.KlarnaOnsiteService = window.KlarnaOnsiteService || [];
      window.KlarnaOnsiteService.push({eventName: 'refresh-placements'});
    }
    setTimeout(() => {
    }, 50);
  }

  updateVariant(variant) {
    if(!variant) {
      return;
    }

    let $selectedOption;

    this.$bundleProducts.each((index, el) => {
      const $this = $(el);

      if ($this.is(':checked')) {
        $selectedOption = $this.parent();
      };
    })

    $(selectors.bundleProductImage, $selectedOption).attr('src', imageUtils.getSizedImageUrl(variant.featured_image.src, '70x'));
    $(selectors.bundleProductImage, $selectedOption).attr('data-src', imageUtils.getSizedImageUrl(variant.featured_image.src, '70x'));

    for (let i = 1; i <= 3; i++) {
      const optionIndex = `option${i}`;
      const optionSelector = `[data-option-${i}]`;
      $(optionSelector, $selectedOption).text(variant[optionIndex]);
    }

    $(selectors.bundleProductId, $selectedOption).val(variant.id);

    if(variant.available) {
      $(selectors.bundleProductSoldout, $selectedOption).removeClass(classes.visible);
      $(selectors.productAddToCart).text(theme.strings.addToCart);
    } else {
      $(selectors.bundleProductSoldout, $selectedOption).addClass(classes.visible);
    }
    this.updateKlarnaPrice();
    this.checkProductsAvailabilty();
  }

  checkProductsAvailabilty() {
    const activeProducts = this.$bundleProducts.filter((index, el) => {
      if($(el).parent().is(':visible')) {
        return el;
      }
    })
    activeProducts.each((index, el) => {
      if($(selectors.bundleProductSoldout, $(el).parent()).is(':visible')) {
        $(selectors.productAddToCart).prop('disabled', true).text(theme.strings.soldOut);
      }
    })
  }

  onProductSelectedChange(evt) {
    const $this = $(evt.currentTarget).parent();
    const optionsQuantity = $('[data-option-position]', this.$container).length;
    for(let i = 1; i <=3 ; i++) {
      const optionSelectorId = `[data-option-${i}]`;
      const optionValue = $(optionSelectorId, $this).text().trim();
      if(optionValue) {
        const variantOptionSelector = `#SingleOptionSelector-${i-1}`;
        $(variantOptionSelector).val(optionValue);
        if(i === optionsQuantity) {
          $(variantOptionSelector).trigger('change');
        }
      }
    }
  }
}
