import $ from 'jquery';
import * as imageUtils from '../core/image';
import * as Currency from '../core/currency';

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
  productAddToCartText: '[data-add-to-cart-text]',
  productAddtoCartPrice: '[data-add-to-cart-price]',
  klarnaMessagingPrice: '[data-purchase-amount]',
  bundleDiscountPrice: '[data-bundle-discount-price]',
  bundleFullPrice: '[data-bundle-current-price]',
  bundleItemPrice: '[data-bundle-discount-price]',
  bundleItemComparePrice: '[data-bundle-compare-price]',
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
    this.bundleDiscountValue = 0;
  }

  onBundleOptionChange(evt) {
    const $this = $(evt.currentTarget);
    const selectedQty = $this.val();
    this.bundleDiscountValue = $this.data('bundle-discount');
    this.updateKlarnaPrice($this.parent());

    this.$bundleProducts.each((index, el) => {
      const $productParent = $(el).parent();
      if(index + 1 <= selectedQty) {
        $productParent.addClass(classes.visible);
      } else {
        $productParent.removeClass(classes.visible);
      }
    })

    if(selectedQty > 1) {
      this.$bundleProductsContainer.show();
      this.$bundleProducts.first().prop('checked', true);
    } else {
      this.$bundleProductsContainer.hide();
      this.$bundleProducts.prop('checked', false);
      this.bundleDiscountValue = 0;
    }

    this.updateTotalPrice(true);
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
      $(selectors.productAddToCartText).text(theme.strings.addToCart);
    } else {
      $(selectors.bundleProductSoldout, $selectedOption).addClass(classes.visible);
    }

    if(variant.compare_at_price > variant.price) {
      $(selectors.bundleFullPrice, $selectedOption).text(Currency.formatMoney(variant.compare_at_price, window.theme.moneyFormat).replace('.00', ''));
      $(selectors.bundleDiscountPrice, $selectedOption).text(Currency.formatMoney(variant.price, window.theme.moneyFormat).replace('.00', ''));
      $(selectors.bundleDiscountPrice, $selectedOption).attr('data-variant-price', variant.price);
    } else {
      $(selectors.bundleFullPrice, $selectedOption).text('');
      $(selectors.bundleDiscountPrice, $selectedOption).text(Currency.formatMoney(variant.price, window.theme.moneyFormat).replace('.00', ''));
      $(selectors.bundleDiscountPrice, $selectedOption).attr('data-variant-price', variant.price);
    }
    this.updateKlarnaPrice();
    this.checkProductsAvailabilty();
    this.updateTotalPrice();
  }

  checkProductsAvailabilty() {
    const activeProducts = this.$bundleProducts.filter((index, el) => {
      if($(el).parent().is(':visible')) {
        return el;
      }
    })
    activeProducts.each((index, el) => {
      if($(selectors.bundleProductSoldout, $(el).parent()).is(':visible')) {
        $(selectors.productAddToCart).prop('disabled', true)
        $(selectors.productAddToCartText).text(theme.strings.soldOut);
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

  updateTotalPrice() {
    let totalPrice = 0;
    this.$bundleProducts.each((i, product) => {
      const $product = $(product).parent();

      if($product.hasClass('is-visible')) {
        console.log('who is active?');
        totalPrice += $product.find(selectors.bundleDiscountPrice).data('variant-price');
      };
    })

    const discountPercentage = (100 - this.bundleDiscountValue) / 100;
    totalPrice *= discountPercentage;

    $(selectors.productAddtoCartPrice).text(Currency.formatMoney(totalPrice, theme.moneyFormat).replace('.00', ''));
  }
}
