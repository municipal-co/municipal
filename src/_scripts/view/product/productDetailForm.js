import $ from 'jquery';
import * as Utils from '../../core/utils';
import * as Currency from '../../core/currency';
import Drawer from '../../ui/drawer';
import Variants from './variants';
import ProductBundles from '../../managers/product-bundles'

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
  bisContainer: '[data-bis-container]',
  bisForm: '[data-bis-form]',
  bisButton: '[data-bis-button]',
  bisToggler: '[data-bis-toggler]',
  bisVariantOption: '[data-bis-variant-option]',
  bisVariantId: '[data-bis-variant-id]',
  bisFeaturedImage: '[data-bis-featured-image]',
  bisEmailInput: '[data-bis-email-input]',
  bisResponseMessage: '[data-bis-response-message]',
  klarnaOnsiteMessagingPrice: '[data-purchase-amount]',
  // Size drawer toggler
  pdpOptionDrawerToggler: '[data-pdp-drawer-toggler]',
  pdpOptionDrawer: '[data-pdp-option-drawer]',
};

const classes = {
  hide: 'hide',
  variantOptionValueActive: 'is-active',
  open: 'is-open',
  submitted: 'submitted',
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
      CLICK:  `click${this.namespace}`,
      SUBMIT: `submit${this.namespace}`,
    };

    const defaults = {
      $container: null,
      onVariantChange: $.noop,
      enableHistoryState: true,
      lowQuantityThreshold: 0
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
    this.$bisDrawer              = $(selectors.bisContainer);
    this.$bisButton              = $(selectors.bisButton);
    this.$bisToggler             = $(selectors.bisToggler);
    this.$bisForm                = $(selectors.bisForm);
    this.$bisEmailInput          = $(selectors.bisEmailInput, this.$bisForm);
    this.$bisResponseMessage     = $(selectors.bisResponseMessage);
    this.$pdpDrawerToggler       = $(selectors.pdpOptionDrawerToggler, this.$container);
    this.$pdpOptionDrawers       = $(selectors.pdpOptionDrawer, this.$container);

    /* eslint-enable */

    this.optionDrawers = this._setUpOptionDrawers();
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
    this.$bisToggler.on(this.events.CLICK, this.toggleBisContainer.bind(this));
    this.$bisForm.on('submit', this.onBisSubmit.bind(this));
    this.$pdpDrawerToggler.on('click', this._toggleOptionDrawer.bind(this));
    Utils.chosenSelects(this.$container);
    this.productBundles = new ProductBundles(this.$container);

    this.checkVariantsAvailability(this.variants.currentVariant);
    // this.updateBadge(this.variants.currentVariant);
    this.productColorValidation();
  }

  onVariantChange(evt) {
    const variant = evt.variant;

    this.updateProductPrices(variant);
    this.updateAddToCartState(variant);
    this.updateQuantitySelect(variant);
    this.updateVariantOptionValues(variant);
    this.updateSelectedOptionLabel(variant);
    this.updateFullDetailsLink(variant);
    this.checkVariantsAvailability(variant);
    // this.updateColorsLink();
    // this.updateBadge(variant);
    this.updateKlarnaPricing(variant);
    // this.productBundles.updateVariant(variant);
  }

  // /**
  //  * Updates the URL of the color dots on PDP that contains collection colors
  //  *
  //  */

  // updateColorsLink() {
  //   const $sizeDotsContainer = $(selectors.dotsContainer).not(selectors.dotsColorContainer);
  //   const variantName = $('.dot.is-active', $sizeDotsContainer).attr('title');

  //   $('a', selectors.dotsColorContainer).each((index, el) => {
  //     const currentUrl = $(el).attr('href');
  //     const newUrl = Utils.getUrlWithUpdatedQueryStringParameter('size', variantName, currentUrl);
  //     $(el).attr('href', newUrl);
  //   })
  // }

  /**
   * Updates the DOM state of the add to cart button
   *
   * @param {Object} variant - Shopify variant object
   */
  updateAddToCartState(variant) {
    if (variant) {
      this.$priceWrapper.removeClass(classes.hide);
    } else {
      this.$addToCartBtn.prop('disabled', true).show();
      this.$addToCartBtnText.html(theme.strings.unavailable);
      this.$priceWrapper.addClass(classes.hide);
      this.$bisButton.hide();
      return;
    }

    if (variant.available) {
      this.$addToCartBtn.prop('disabled', false);
      this.$addToCartBtnText.html(theme.strings.addToCart);
      this.$addToCartBtn.show();
    } else {
      this.$addToCartBtn.prop('disabled', true);
      this.$addToCartBtnText.html(theme.strings.soldOut);
      this.$addToCartBtn.show();

      if(this.productSingleObject.metafields.enable_sold_out !== 1 || variant.metafields.enable_sold_out !== 1) {
        this.$addToCartBtnText.html(theme.strings.unavailable);
      }

      if(this.productSingleObject.metafields.enable_bis === 1 || variant.metafields.enable_bis === 1) {
        this.$addToCartBtnText.html(theme.strings.soldOut);
      }
    }
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

  updateSelectedOptionLabel(variant) {
    for(let i = 1; i <= 3; i++) {
      $(`[data-selected-option=option${i}]`).text(variant[`option${i}`]);
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
    console.log('clicked on a variant option');
    const $option = $(e.currentTarget);

    if ($option.hasClass(classes.variantOptionValueActive) || $option.closest('.dots--disabled').length > 0 || $option.closest('.dots--placeholder').length > 0) {
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

  checkVariantsAvailability(currentVariant) {
    let colorOptionIndex;

    $.each(this.productSingleObject.options_with_values, (i, option) => {
      if(option.name === 'Color' || option.name === 'color') {
        colorOptionIndex = 'option' + option.position;
      }
    });


    const otherOptions = this.$singleOptionSelectors.filter((index, el) => {
      if ($(el).data('product-option') !== colorOptionIndex) {
        return true;
      }

      return false;
    })

    $.each(this.productSingleObject.variants, (i, variant) => {
      if(variant[colorOptionIndex] === currentVariant[colorOptionIndex]) {
        this.updateAvailableVariants(variant, otherOptions, variant.available);
      }
    })
  }

  updateAvailableVariants(variant, otherOptions, enabled = false) {
    otherOptions.each((i, el) => {
      const $el = $(el);
      const $uiContainer = $(el).siblings('[data-option-ui]');
      const optionIndex = $el.data('index');
      if(variant[optionIndex] === $el.val()) {
        if(enabled) {
          $el.prop('disabled', false);
          if(!$uiContainer.length) { return; }

          $uiContainer.find('[data-option-availability]').html(Utils.getPropByString(window, 'theme.strings.available') || 'Available');
          const $quantityContainer = $uiContainer.find('[data-low-quantity]');

          if(variant.inventory_quantity <= this.settings.lowQuantityThreshold) {
            const quantityTemplate = $quantityContainer.data('message-template');
            $quantityContainer.html(quantityTemplate.replace('[quantity]', variant.inventory_quantity));
            $quantityContainer.show();
          } else {
            $quantityContainer.hide();
          }

          $uiContainer.find(selectors.bisButton).hide();

        } else {
          $el.prop('disabled', true);
          $uiContainer.find('[data-option-availability]').html(Utils.getPropByString(window, 'theme.strings.soldOut') || 'Out Of Stock');
          $uiContainer.find('[data-low-quantity]').hide();

          if(variant.metafields.enable_bis === 1) {
            $uiContainer.find(selectors.bisButton).show().attr('data-variant-id', variant.id);
          }
        }
      }
    })

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

  // updateBadge(variant) {
  //   if (variant){
  //     const id = variant.id;
  //     const badgesData = JSON.parse($(selectors.badgesData).html());
  //     let sizeOptionIndex = 0;
  //     let disabledSizeDotsLength = 0;

  //     $.each(this.productSingleObject.options_with_values, (i, option) => {
  //       if(option.name === 'Size' || option.name === 'size') {
  //         sizeOptionIndex = option.position;
  //         return false;
  //       }
  //     })

  //     const $sizeDotsContainer = $(`${selectors.dotsContainer}[data-option-position=${sizeOptionIndex}]`, this.$container);
  //     const $sizeDots = $(selectors.dot, $sizeDotsContainer);
  //     const sizeDotsLength = $sizeDots.length;

  //     $sizeDots.each((i, dot) => {
  //       if($(dot).attr('disabled') === 'disabled') {
  //         disabledSizeDotsLength += 1;
  //       }
  //     });

  //     if(disabledSizeDotsLength === sizeDotsLength) {
  //       $(selectors.badge).text('Sold Out').show();
  //     } else if( badgesData[id] !== null && badgesData[id] !== '') {
  //       $(selectors.badge).text( badgesData[id] ).show();
  //     } else if ( badgesData.default !== '' && badgesData.default !== null ) {
  //       $(selectors.badge).text( badgesData.default ).show();
  //     } else {
  //       $(selectors.badge).text('').hide();
  //     }
  //   } else {
  //     $(selectors.badge).text('').hide();
  //   }

  // }

  toggleBisContainer(evt) {
    const $this = $(evt.currentTarget);
    const variantId = $this.data('variant-id');
    let currentVariant;

    this.$bisDrawer.toggleClass(classes.open);

    if(variantId === undefined) {
      return
    }

    this.productSingleObject.variants.forEach((variant) => {
      if(variant.id === variantId) {
        currentVariant = variant;
        return false;
      }
    })

    if(currentVariant) {
      const id = currentVariant.id;
      const options = this.productSingleObject.options;
      const optionMap = {};

      options.forEach((el, index) => {
        optionMap[el.toLowerCase()] = currentVariant[`option${index+1}`];
      });

      // Update drawer content
      $(selectors.bisFeaturedImage).attr('src', currentVariant.featured_image.src).attr('alt', currentVariant.featured_image.alt);
      $(selectors.bisVariantId).val(id);

      for (const optionName in optionMap) {
        $(`[data-bis-variant-option=${optionName}]`).text(optionMap[optionName])
      }
    }
  }

  updateKlarnaPricing(variant) {
    // refresh klarna widget on variant change
    const $klarnaMessaging = $(selectors.klarnaOnsiteMessagingPrice, this.$container);
    if ($klarnaMessaging.length > 0 && variant) {
      $klarnaMessaging.attr('data-purchase-amount', variant.price);
      window.KlarnaOnsiteService = window.KlarnaOnsiteService || []
      window.KlarnaOnsiteService.push({ eventName: 'refresh-placements' })
    }
  }

  onBisSubmit(evt) {
    evt.preventDefault();

    const publicKey = this.$bisForm.data('api-key');
    const customerEmail = this.$bisEmailInput.val();
    const selectedVariant = $(selectors.bisVariantId, this.$bisForm).val();
    const successMessage = this.$bisForm.data('success-message');
    const errorMessage = this.$bisForm.data('error-message');

    if (this.$bisEmailInput.get(0).checkValidity() === false) {
      this.$bisEmailInput.addClass('has-error');
      return;
    }

    $.ajax({
      type: 'POST',
      url:  'https://a.klaviyo.com/onsite/components/back-in-stock/subscribe',
      data: {
        a: publicKey,
        email: customerEmail,
        variant: selectedVariant,
        platform: 'shopify'
      }
    }).done((data) => {
      if(data.success == true) {
        this.$bisForm.addClass(classes.submitted);
        this.$bisResponseMessage.text(successMessage);
      } else {
        this.$bisForm.addClass(classes.submitted);
        this.$bisResponseMessage.text(errorMessage);

        setTimeout(() => {
          this.$bisForm.removeClass(classes.submitted);
        }, 5000);
      }
    })
  }

  productColorValidation() {
    const colorsToHide = [];
    const colorOption = this.productSingleObject.options_with_values.filter((option) => {
      if (option.name === 'Color' || option.name === 'color') {
        return true;
      };
      return false;
    });

    if(colorOption.length === 0) {
      return false;
    }

    const optionPosition = `option${colorOption[0].position}`;

    colorOption[0].values.forEach((color) => {

      if(this._validateColorAvailability(color, optionPosition)) {
        colorsToHide.push(color);

        if(this.variants.currentVariant[optionPosition] === color) {
          this._disablePurchase();
        }
      };
    });

    colorsToHide.forEach((color) => {
      $(`${selectors.singleOptionSelector}[value="${color}"]`).parent().hide();
    })
  }

  _validateColorAvailability(color, optionPosition) {
    const colorVariants = this.productSingleObject.variants.filter((variant, position) => {
      if(variant[optionPosition] === color) {
        return true;
      }
      return false;
    });
    const variantCount = colorVariants.length;
    let unavailableVariantcount = 0;

    colorVariants.forEach((variant) => {
      if(variant.metafields.enable_bis || variant.metafields.enable_sold_out) {
        return false;
      }

      if(!variant.available) {
        unavailableVariantcount++;
      }
    });

    if(unavailableVariantcount === variantCount) {
      return true;
    }

    return false;
  }

  _disablePurchase() {
    this.$addToCartBtn.prop('disabled', true).show();
    this.$addToCartBtnText.html(theme.strings.unavailable);
    this.$priceWrapper.addClass(classes.hide);
    this.$bisButton.hide();
    $(selectors.dotsContainer, this.$container).not('.dots--color').addClass('dots--disabled');
  }

  _setUpOptionDrawers() {
    const drawerList = [];
    this.$pdpOptionDrawers.each( (index, el) => {
      const drawerId = $(el).data('drawer-id');

      const drawerObject = {
        id: drawerId,
        drawer: new Drawer($(el))
      }
      drawerList.push(drawerObject);
    })

    return drawerList;
  }

  _toggleOptionDrawer(evt) {
    const $this = $(evt.currentTarget);
    const drawerId = $this.data('drawer-id');

    const drawerObject = this.optionDrawers.filter((drawerItem) => {
      if( drawerItem.id === drawerId) {
        return true;
      }
    })

    drawerObject[0].drawer.toggle();
  }
}
