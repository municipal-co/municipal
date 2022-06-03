import $ from 'jquery';
import * as imageUtils from '../core/image';

const selectors = {
  bundleOption: '[data-bundle-option]',
  bundleProduct: '[data-bundle-product]',
  bundleProductsContainer: '[data-bundle-products]',
  bundleProductId: '[data-bundle-product-id]',
  bundleProductImage: '[data-bundle-product-image]',
  productDrawer: '[data-product-drawer]',
  productOption1: '[data-option-1]',
  productOption2: '[data-option-2]',
  productOption3: '[data-option-3]',
  proudctComparePrice: '[data-item-compare-price]',
  productFullPrice: '[data-item-full-price]',
  bundleEditToggle: '[data-bundle-edit-toggle]',
  addToCartPrice: '[data-add-to-cart-price]',
  productAddToCart: '[data-add-to-cart]',
}

const classes = {
  open: 'is-open',
}

export default class ProductBundles {
  constructor($container) {
    this.name = 'productBundlesManager';
    this.namespace = `.${this.name}`;
    this.$container = $container;

    this.$bundleOptions = $(selectors.bundleOption, this.$container);
    this.$bundleProductsContainer = $(selectors.bundleProductsContainer, this.$container);
    this.$bundleProducts = $(selectors.bundleProduct, this.$container);
    this.$bundleEditToggle = $(selectors.bundleEditToggle);

    this.$bundleOptions.on('change', this.onBundleOptionChange.bind(this));
    this.$bundleEditToggle.on('click', this.toggleBundleDrawer.bind(this));
    // this.$bundleProducts.on('change', this.onProductSelectedChange.bind(this));
  }

  onBundleOptionChange(evt) {
    const $this = $(evt.currentTarget);
    const selectedQty = $this.val();

    if(selectedQty > 1) {
      this.$bundleProductsContainer.show();
      this.$bundleProducts.each((index, product) => {
        const $product =$(product);
        if(index + 1 <= selectedQty) {
          $(product).show();
        } else {
          $(product).hide();
        }
      })
    } else {
      this.$bundleProductsContainer.hide();
      this.$bundleProducts.hide()
    }
  }

  toggleBundleDrawer(evt) {
    const $this = $(evt.currentTarget);
    const $container = $this.parents(selectors.bundleProduct);
    const $drawer = $container.find(selectors.productDrawer);

    if($container.hasClass(classes.open)) {
      $container.removeClass(classes.open);
      $drawer.css('height', 0);
    } else {
      const drawerHeight = $container.find(selectors.productDrawer).get(0).scrollHeight;

      $container.addClass(classes.open);
      $drawer.css('height', drawerHeight);
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
