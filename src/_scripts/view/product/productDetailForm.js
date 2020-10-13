import $ from 'jquery';
import * as Utils from '../../core/utils';
import * as Currency from '../../core/currency';
import Variants from './variants';

const selectors = {
  addToCart: '[data-add-to-cart]',
  addToCartText: '[data-add-to-cart-text]',
  comparePrice: '[data-compare-price]',
  comparePriceText: '[data-compare-text]',
  originalSelectorId: '[data-product-select]',
  priceWrapper: '[data-price-wrapper]',
  productJson: '[data-product-json]',
  productPrice: '[data-product-price]',
  singleOptionSelector: '[data-single-option-selector]',
  variantOptionValueList: '[data-variant-option-value-list][data-option-position]',
  variantOptionValue: '[data-variant-option-value]',
  quantitySelect: '[data-product-quantity-select]',
  fullDetailsLink: '[data-full-details-link]',
  selectedOption: '[data-selected-option]',
  shippingModal: '[data-shipping-modal]',
  shippingModalTrigger: '[data-shipping-modal-trigger]',
  badge: '[data-badge]',
  badgesData: '[data-badges-json]',
  dotsColorContainer: '.dots--color',
  dotsContainer: '.dots',
  dot: '.dot',
  backInStockButton: '[data-bis-button]'
};

const classes = {
  hide: 'hide',
  variantOptionValueActive: 'is-active'
};

export default class ProductDetailForm {
  /**
   * ProductDetailForm constructor
   *
   * @param { Object } config
   * @param { jQuery } config.$container - Main element, see snippets/product-detail-form.liquid
   * @param { Function } config.onVariantChange -  Called when a new variant has been selected from the form,
   * @param { Boolean } config.enableHistoryState - If set to "true", turns on URL updating when switching variant
   */
  constructor(config) {
    this.settings = {};
    this.name = 'productDetailForm';
    this.namespace = `.${this.name}`;

    this.events = {
      RESIZE: `resize${this.namespace}`,
      CLICK:  `click${this.namespace}`
    };

    const defaults = {
      $container: null,
      onVariantChange: $.noop,
      enableHistoryState: true
    };

    this.settings = $.extend({}, defaults, config);

    if (!this.settings.$container || this.settings.$container.length === 0) {
      console.warn(`[${this.name}] - config.$container required to initialize`);
      return;
    }

    /* eslint-disable */
    /* temporarily disable to allow long lines for element descriptions */
    this.$container              = this.settings.$container; // Scoping element for all DOM lookups
    this.$quantitySelect         = $(selectors.quantitySelect, this.$container); // Quantity dropdown
    this.$fullDetailsLink        = $(selectors.fullDetailsLink, this.$container); // Inside quickview, link that points back to the full product
    this.$addToCartBtn           = $(selectors.addToCart, this.$container);
    this.$addToCartBtnText       = $(selectors.addToCartText, this.$container); // Text inside the add to cart button
    this.$priceWrapper           = $(selectors.priceWrapper, this.$container); // Contains all price elements
    this.$productPrice           = $(selectors.productPrice, this.$container);
    this.$comparePrice           = $(selectors.comparePrice, this.$container);
    this.$compareEls             = this.$comparePrice.add($(selectors.comparePriceText, this.$container));
    this.$singleOptionSelectors  = $(selectors.singleOptionSelector, this.$container); // Dropdowns for each variant option containing all values for that option
    this.$variantOptionValueList = $(selectors.variantOptionValueList, this.$container); // Alternate UI that takes the place of a single option selector (could be swatches, dots, buttons, whatever..)
    this.$shippingModalTrigger   = $(selectors.shippingModalTrigger, this.$container);
    this.$shippingModal          = $(selectors.shippingModal); // Don't wrap this on container, the modal is outside
    /* eslint-enable */

    this.productSingleObject  = JSON.parse($(selectors.productJson, this.$container).html());

    this.variants = new Variants({
      $container: this.$container,
      enableHistoryState: this.settings.enableHistoryState,
      singleOptionSelector: selectors.singleOptionSelector,
      originalSelectorId: selectors.originalSelectorId,
      product: this.productSingleObject
    });

    this.$container.on('variantChange', this.onVariantChange.bind(this));
    this.$container.on(this.events.CLICK, selectors.variantOptionValue, this.onVariantOptionValueClick.bind(this));
    this.$shippingModalTrigger.on(this.events.CLICK, this.openShippingModal.bind(this));

    Utils.chosenSelects(this.$container);

    const queryParams = Utils.getQueryParams();

    if (typeof queryParams.size !== 'undefined') {
      this.updateSizeVariant(queryParams.size);
    }

    this.checkVariantsAvailability();
    this.updateBISstatus();
  }

  onVariantChange(evt) {
    const variant = evt.variant;

    this.updateProductPrices(variant);
    this.updateAddToCartState(variant);
    this.updateQuantitySelect(variant);
    this.updateVariantOptionValues(variant);
    this.updateFullDetailsLink(variant);
    this.updateColorsLink();
    this.checkVariantsAvailability();
    this.updateBadge(variant);
    this.updateBISstatus(variant);

    this.$singleOptionSelectors.trigger('chosen:updated');

    this.settings.onVariantChange(variant);
  }

  /**
   * Updates the selected size variant depending on a get parameter size.
   *
   * @param {string} size - Shopify size option name
   */

  updateSizeVariant(size) {
    $(`.dot[title="${size}"]`).trigger('click');
  }

  /**
   * Updates the URL of the color dots on PDP that contains collection colors
   *
   */

  updateColorsLink() {
    const $sizeDotsContainer = $(selectors.dotsContainer).not(selectors.dotsColorContainer);
    const variantName = $('.dot.is-active', $sizeDotsContainer).attr('title');

    $('a', selectors.dotsColorContainer).each((index, el) => {
      const currentUrl = $(el).attr('href');
      const newUrl = Utils.getUrlWithUpdatedQueryStringParameter('size', variantName, currentUrl);
      $(el).attr('href', newUrl);
    })
  }

  /**
   * Updates the DOM state of the add to cart button
   *
   * @param {Object} variant - Shopify variant object
   */
  updateAddToCartState(variant) {
    if (variant) {
      this.$priceWrapper.removeClass(classes.hide);
    }
    else {
      this.$addToCartBtn.prop('disabled', true);
      this.$addToCartBtnText.html(theme.strings.unavailable);
      this.$priceWrapper.addClass(classes.hide);
      return;
    }

    if (variant.available) {
      this.$addToCartBtn.prop('disabled', false);
      this.$addToCartBtnText.html(theme.strings.addToCart);
    }
    else {
      this.$addToCartBtn.prop('disabled', true);
      this.$addToCartBtnText.html(theme.strings.soldOut);
    }
  }

  updateBISstatus(variant) {
    let id;
    const backInStock = this.$container.data('back-in-stock');
    const $bisButton = $(selectors.backInStockButton);
    const $addToCartBtn = $(selectors.addToCart);
    if (variant !== undefined && variant !== null) {
      id = variant.id;
    } else {
      id = $(selectors.singleOptionSelector).val();
    }

    $.each(this.productSingleObject.variants, (index, variantItem) => {
      if(variantItem.id === id) {
        if ( backInStock === true && !variantItem.available) {
          $bisButton.show();
          $bisButton.attr('data-variant-id', id);
          $addToCartBtn.hide();
        } else if(backInStock === true && variant.available) {
          $bisButton.hide();
          $addToCartBtn.show();
        } else {
          $bisButton.hide();
          $addToCartBtn.show();
        }
      }
    })
  }

  /**
   * Updates the disabled property of the quantity select based on the availability of the selected variant
   *
   * @param {Object} variant - Shopify variant object
   */
  updateQuantitySelect(variant) {
    // Close the select while we make changes to it
    this.$quantitySelect.trigger('chosen:close');

    this.$quantitySelect.prop('disabled', !(variant && variant.available));

    this.$quantitySelect.trigger('chosen:updated');
  }

  /**
   * Updates the DOM with specified prices
   *
   * @param {Object} variant - Shopify variant object
   */
  updateProductPrices(variant) {
    if (variant) {
      this.$productPrice.html(Currency.formatMoney(variant.price, window.theme.moneyFormat));

      if (variant.compare_at_price > variant.price) {
        this.$comparePrice.html(Currency.formatMoney(variant.compare_at_price, theme.moneyFormat));
        this.$compareEls.removeClass(classes.hide);
      }
      else {
        this.$comparePrice.html('');
        this.$compareEls.addClass(classes.hide);
      }
    }
  }

  /**
   * Updates the DOM state of the elements matching the variantOption Value selector based on the currently selected variant
   *
   * @param {Object} variant - Shopify variant object
   */
  updateVariantOptionValues(variant) {
    if (variant) {
      // Loop through all the options and update the option value
      for (let i = 1; i <= 3; i++) {
        const variantOptionValue = variant[`option${i}`];

        if (!variantOptionValue) break; // Break if the product doesn't have an option at this index

        // Since we are finding the variantOptionValueUI based on the *actual* value, we need to scope to the correct list
        // As some products can have the same values for different variant options (waist + inseam both use "32", "34", etc..)
        const $list = this.$variantOptionValueList.filter(`[data-option-position="${i}"]`);
        const $variantOptionValueUI   = $list.find('[data-variant-option-value="'+variantOptionValue+'"]');

        $variantOptionValueUI.addClass(classes.variantOptionValueActive);
        $variantOptionValueUI.siblings().removeClass(classes.variantOptionValueActive);
        const variantChangeEvent = $.Event('updateVariant', {variantSelected: variantOptionValue} );
        $('body').trigger(variantChangeEvent);
      }
    }
  }

  /**
   * Used on quick view, updates the "view full details" link to point to the currently selected variant
   *
   * @param {Object} variant - Shopify variant object
   */
  updateFullDetailsLink(variant) {
    let updatedUrl;

    if (variant && this.$fullDetailsLink.length) {
      updatedUrl = Utils.getUrlWithUpdatedQueryStringParameter('variant', variant.id, this.$fullDetailsLink.attr('href'));
      this.$fullDetailsLink.attr('href', updatedUrl);
    }
  }

  /**
   * Handle variant option value click event.
   * Update the associated select tag and update the UI for this value
   *
   * @param {event} evt
   */
  onVariantOptionValueClick(e) {
    const $option = $(e.currentTarget);

    if ($option.hasClass(classes.variantOptionValueActive)) {
      return;
    }

    const value     = $option.data('variant-option-value');
    const position  = $option.parents(selectors.variantOptionValueList).data('option-position');
    const $selector = this.$singleOptionSelectors.filter(`[data-index="option${position}"]`);
    const $optionLabel = $(`[data-selected-option-${position}]`);

    $selector.val(value);
    $selector.trigger('change');

    $option.addClass(classes.variantOptionValueActive);
    $option.siblings().removeClass(classes.variantOptionValueActive);
    $optionLabel.text(value);

  }

  checkVariantsAvailability() {
    this.$singleOptionSelectors.each((index, el) => {
      const $el = $(el);
      const selectedVariant = $el.val();
      const optionIndex = $el.data('index');

      $.each(this.productSingleObject.variants, (i, variant) => {
        if (variant[optionIndex] === selectedVariant) {
          const unavailableVariant = !variant.available;
          this.updateUnavailableVariants(variant, optionIndex, unavailableVariant);
        }
      });
    })
  }

  updateUnavailableVariants(variant, optionIndex, disabled = false) {
    for (let i = 1; i <= 3; i++) {
      const currentOption = 'option' + i;
      if (optionIndex !== currentOption) {
        const dotToUpdate = variant[currentOption];

        $(`.dot[data-variant-option-value="${dotToUpdate}"]`).attr('disabled', disabled);
      }
    }
  }

  /**
   * Opens shipping information modal
   *
   * @param {event} evt
   */

  openShippingModal(evt) {
    evt.preventDefault();
    this.$shippingModal.modal('show');
  }

  updateBadge(variant) {
    let id;
    if (variant) {
      id = variant.id;
    }
    const badgesData = JSON.parse($(selectors.badgesData).html());

    if( variant !== null && badgesData[id] !== null && badgesData[id] !== '') {
      $(selectors.badge).text( badgesData[id] ).show();
    } else if (badgesData.default !== '' && badgesData.default !== null ) {
      $(selectors.badge).text( badgesData.default ).show();
    } else {
      $(selectors.badge).text('').hide();
    }

  }

}
