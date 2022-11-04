import $ from 'jquery';
import Swiper from 'swiper';
import * as Utils from '../../core/utils';
import * as Currency from '../../core/currency';
import Drawer from '../../ui/drawer';
import Variants from './variants';
import ProductBundles from '../../managers/product-bundles'

const selectors = {
  optionsContainer: '[data-product-detail-options]',
  addToCart: '[data-add-to-cart]',
  addToCartText: '[data-add-to-cart-text]',
  comparePrice: '[data-compare-price]',
  comparePriceText: '[data-compare-text]',
  originalSelectorId: '[data-product-select]',
  priceWrapper: '[data-price-wrapper]',
  productJson: '[data-product-json]',
  productPrice: '[data-product-price]',
  addToCartPrice: '[data-add-to-cart-price]',
  singleOptionSelector: '[data-single-option-selector]',
  variantOptionValueList: '[data-variant-option-value-list][data-option-position]',
  variantOptionValue: '[data-variant-option-value]',
  quantitySelect: '[data-product-quantity-select]',
  fullDetailsLink: '[data-full-details-link]',
  selectedOption: '[data-selected-option]',
  shippingModal: '[data-shipping-modal]',
  shippingModalTrigger: '[data-shipping-modal-trigger]',
  badge: '[data-badge]',
  dotsColorContainer: '.dots--color',
  dotsContainer: '.dots',
  dot: '.dot',
  klarnaOnsiteMessagingPrice: '[data-purchase-amount]',
  bisButton: '[data-bis-button]',
  // Color Slider
  swatchesSlider: '[data-swatch-slider]',
  swatchSlide: '[data-swatch-slide]',
  // Size drawer toggler
  pdpOptionDrawerToggler: '[data-pdp-drawer-toggler]',
  pdpOptionDrawer: '[data-pdp-option-drawer]',
};

const classes = {
  hide: 'hide',
  variantOptionValueActive: 'is-active',
  open: 'is-open',
  submitted: 'submitted',
  bis: 'is-bis',
  soldOut: 'is-sold-out'
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
      CHANGE: `change${this.namespace}`,
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
    this.$detailOptions          = $(selectors.optionsContainer, this.$container);
    this.$quantitySelect         = $(selectors.quantitySelect, this.$container); // Quantity dropdown
    this.$fullDetailsLink        = $(selectors.fullDetailsLink, this.$container); // Inside quickview, link that points back to the full product
    this.$addToCartBtn           = $(selectors.addToCart, this.$container);
    this.$addToCartBtnText       = $(selectors.addToCartText, this.$container); // Text inside the add to cart button
    this.$priceWrapper           = $(selectors.priceWrapper, this.$container); // Contains all price elements
    this.$atcPrice               = $(selectors.addToCartPrice, this.$container);
    this.$productPrice           = $(selectors.productPrice, this.$container);
    this.$comparePrice           = $(selectors.comparePrice, this.$container);
    this.$compareEls             = this.$comparePrice.add($(selectors.comparePriceText, this.$container));
    this.$singleOptionSelectors  = $(selectors.singleOptionSelector, this.$detailOptions); // Dropdowns for each variant option containing all values for that option
    this.$variantOptionValueList = $(selectors.variantOptionValueList, this.$detailOptions); // Alternate UI that takes the place of a single option selector (could be swatches, dots, buttons, whatever..)
    this.$shippingModalTrigger   = $(selectors.shippingModalTrigger, this.$container);
    this.$shippingModal          = $(selectors.shippingModal); // Don't wrap this on container, the modal is outside
    this.$pdpDrawerToggler       = $(selectors.pdpOptionDrawerToggler, this.$container);
    this.$pdpOptionDrawers       = $(selectors.pdpOptionDrawer, this.$container);
    this.$bisButton              = $(selectors.bisButton, this.$container);
    this.$swatchSlider           = $(selectors.swatchesSlider, this.$container);
    /* eslint-enable */

    this.optionDrawers = this._setUpOptionDrawers();
    this.productSingleObject  = JSON.parse($(selectors.productJson, this.$container).html());

    this.variants = new Variants({
      $container: this.$detailOptions,
      enableHistoryState: this.settings.enableHistoryState,
      singleOptionSelector: selectors.singleOptionSelector,
      originalSelectorId: selectors.originalSelectorId,
      product: this.productSingleObject
    });

    this.$container.on('variantChange', this.onVariantChange.bind(this));
    // this.$container.on(this.events.CLICK, selectors.variantOptionValue, this.onVariantOptionValueClick.bind(this));
    this.$shippingModalTrigger.on(this.events.CLICK, this.openShippingModal.bind(this));
    this.$pdpDrawerToggler.on(this.events.CLICK, this._toggleOptionDrawer.bind(this));
    Utils.chosenSelects(this.$container);
    this.productBundles = new ProductBundles(this.$container, this.productSingleObject);
    this.$singleOptionSelectors.on(this.events.CHANGE, this.onOptionChange.bind(this));
    this.$bisButton.on(this.events.CLICK, this.onBisButtonClick.bind(this));

    this.checkVariantsAvailability(this.variants.currentVariant);
    this.productColorValidation();

    if(this.$swatchSlider.length){
      this.initSwatchesSlider();
    }
    this.updateAddToCartState(this.variants.currentVariant);
    this.updateProductPrices(this.variants.currentVariant, true);
    this.validateSizeAvailability();
  }

  onVariantChange(evt) {
    const variant = evt.variant;

    this.updateProductPrices(variant);
    this.updateAddToCartState(variant);
    this.updateQuantitySelect(variant);
    this.updateVariantOptionValues(variant);
    this.updateFullDetailsLink(variant);
    this.checkVariantsAvailability(variant);
    this.updateKlarnaPricing(variant);
    this.productColorValidation();

    this.settings.onVariantChange(variant);
  }

  onOptionChange(evt) {
    const $this = $(evt.currentTarget);
    const optionIndex = $this.data('product-option');
    const optionValue = $this.val();
    const optionName = $this.data('option-name');

    this.updateSelectedOptionLabel(optionIndex, optionValue, optionName);
    if($this.parents(selectors.pdpOptionDrawer).length > 0){
      const $currentDrawer = $this.parents(selectors.pdpOptionDrawer);

      for(let i = 0; i <= this.optionDrawers.length - 1; i++) {
        if( this.optionDrawers[i].id === $currentDrawer.data('drawer-id')) {
          this.optionDrawers[i].drawer.hide();
          break;
        }
      }
    }
  }

  initSwatchesSlider() {
    let currentSlide = 0;
    this.$swatchSlider.each((i, slider) => {
      const $slider = $(slider);
      const $swatchSlides = $(selectors.swatchSlide, $slider);
      const $scrollbar = $('.swiper-scrollbar', $slider);

      $swatchSlides.each((index, el) => {
        if($(el).find('input[type=radio]:checked').length) {
          currentSlide = index;
          return false;
        }
      })

      this.swatchSlider = new Swiper(this.$swatchSlider.get(0), {
        slide: selectors.swatchSlide,
        slidesPerView: 4.7,
        spaceBetween: 8,
        threshold: 10,
        initialSlide: $swatchSlides.length <= 4 ? false : currentSlide,
        watchOverflow: true,
        slidesOffsetBefore: 30,
        slidesOffsetAfter: 30,
        scrollbar: $swatchSlides.length <= 4 ? false : {
          el: '.swiper-scrollbar',
          draggable: true,
        },
        navigation: {
          prevEl: '[data-arrow-prev]',
          nextEl: '[data-arrow-next]'
        },
      });
    })
  }

  /**
   * Updates the DOM state of the add to cart button
   *
   * @param {Object} variant - Shopify variant object
   */
  updateAddToCartState(variant) {

    const optionLenght = this.productSingleObject.options.length;

    let selectedOptions = 0;

    this.$singleOptionSelectors.each((i, el) => {
      if($(el).is(':radio') && $(el).is(':checked')) {
        selectedOptions ++;
      } else if ($(el).is('select') && $(el).val() !== '') {
        selectedOptions ++;
      }
    })

    if(selectedOptions < optionLenght) {
      this.$addToCartBtn.prop('disabled', true);
      this.$addToCartBtnText.html(theme.strings.addToCart);
      this.$atcPrice.show();
      return;
    }

    if (variant) {
      this.$priceWrapper.removeClass(classes.hide);
    } else {
      this.$addToCartBtn.prop('disabled', true).show();
      this.$addToCartBtnText.html(theme.strings.unavailable);
      this.$priceWrapper.addClass(classes.hide);
      this.$atcPrice.hide();
      return;
    }

    if (variant.available) {
      this.$addToCartBtn.prop('disabled', false);
      this.$addToCartBtnText.html(theme.strings.addToCart);
      this.$addToCartBtn.show();
      this.$atcPrice.show();
    } else {
      this.$addToCartBtn.prop('disabled', true);
      this.$addToCartBtnText.html(theme.strings.soldOut);
      this.$atcPrice.show();
      this.$addToCartBtn.show();

      if(this.productSingleObject.metafields.enable_sold_out !== 1 || variant.metafields.enable_sold_out !== 1) {
        this.$addToCartBtnText.html(theme.strings.unavailable);
        this.$atcPrice.hide();
      }

      if(this.productSingleObject.metafields.enable_bis === 1 || variant.metafields.enable_bis === 1) {
        this.$addToCartBtnText.html(theme.strings.soldOut);
        this.$atcPrice.hide();
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
  updateProductPrices(variant, firstCheck) {
    if(firstCheck && this.productSingleObject.type === 'Gift Card') {
      this.$atcPrice.hide();
    }

    if (variant) {
      this.$productPrice.html(Currency.formatMoney(variant.price, window.theme.moneyFormat).replace('.00', ''));
      this.$atcPrice.html(Currency.formatMoney(variant.price, window.theme.moneyFormat).replace('.00', ''));

      if (variant.compare_at_price > variant.price) {
        this.$comparePrice.html(Currency.formatMoney(variant.compare_at_price, theme.moneyFormat).replace('.00', ''));
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

  updateSelectedOptionLabel(index, value, name) {
    if(name === 'size' || name === 'Size' || name === 'amount' || name === 'Amount' ) {
      const updatedValue = value === 'OS' ? 'One Size' : value;
      $(`[data-selected-option=${index}]`, this.$detailOptions).html(`Selected ${name}: <span class="product-option__drawer-btn-value">${updatedValue}</span>`);
      $(`[data-selected-option=${index}]`, this.$detailOptions).parent().addClass('is-active');
    } else {
      $(`[data-selected-option=${index}]`, this.$detailOptions).text(value);
      this.validateSizeAvailability.call(this, $(`[data-option-value="${value.toLowerCase()}"]`).parent());
    }
  }

  validateSizeAvailability(currentOption) {
    let sizeIndex;
    let colorIndex;
    let $currentOption = currentOption;

    this.productSingleObject.options_with_values.forEach((evalOption, index) => {
      if(evalOption.name === 'size' || evalOption.name === 'Size') {
        sizeIndex = `option${evalOption.position}`;
      }
      if(evalOption.name === 'Color' || evalOption.name === 'color') {
        colorIndex = `option${evalOption.position}`;
      }
    })

    if(typeof currentOption === 'undefined') {
      $currentOption = $(`[data-product-option=${colorIndex}]:checked`, this.$detailOptions).parent();
    }

    const $selectedSize = $(`[data-product-option=${sizeIndex}]:checked`, this.$detailOptions);

    if($currentOption.is('.is-bis')) {
      $(`[data-selected-option=${sizeIndex}]`).text('Notify me when back');
      this._disablePurchase(true);
    } else if ($currentOption.is('.is-sold-out')) {
      $(`[data-selected-option=${sizeIndex}]`).parent().prop('disabled', true);
      this._disablePurchase(true)
    } else if($selectedSize.length) {
      const optionValue = $selectedSize.val() === 'OS' ? 'One Size' : $selectedSize.val();
      $(`[data-selected-option=${sizeIndex}]`).parent().prop('disabled', false);
      $(`[data-selected-option=${sizeIndex}]`).html(`Selected Size: <span class="product-option__drawer-btn-value">${optionValue}</span>`);
    } else {
      $(`[data-selected-option=${sizeIndex}]`).parent().prop('disabled', false);
      $(`[data-selected-option=${sizeIndex}]`).text('Select Size');

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

  checkVariantsAvailability(currentVariant) {
    let colorOptionIndex;

    $.each(this.productSingleObject.options_with_values, (i, option) => {
      if(option.name === 'Color' || option.name === 'color') {
        colorOptionIndex = `option${option.position}`;
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

          if(variant.inventory_quantity <= this.settings.lowQuantityThreshold && variant.inventory_quantity > 0) {
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
          } else {
            $uiContainer.find(selectors.bisButton).hide();
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

  updateKlarnaPricing(variant) {
    // refresh klarna widget on variant change
    const $klarnaMessaging = $(selectors.klarnaOnsiteMessagingPrice, this.$container);
    if ($klarnaMessaging.length > 0 && variant) {
      $klarnaMessaging.attr('data-purchase-amount', variant.price);
      window.KlarnaOnsiteService = window.KlarnaOnsiteService || []
      window.KlarnaOnsiteService.push({ eventName: 'refresh-placements' })
    }
  }

  productColorValidation() {
    const colorsToHide = [];
    const soldOutColors = [];

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
      const colorState = this._validateColorAvailability(color, optionPosition);
      if(colorState.hideColor) {
        colorsToHide.push(color);

        if(this.variants.currentVariant[optionPosition] === color) {
          this._disablePurchase();
        }
      };

      if(colorState.soldOutColor && !colorState.hideColor) {
        soldOutColors.push({
          color: color,
          enableBis: colorState.enableBis
        });
      }
    });

    colorsToHide.forEach((color) => {
      $(`${selectors.singleOptionSelector}[value="${color}"]`).parent().removeAttr('swiper-slide').hide();
    })

    soldOutColors.forEach((colorObject) => {
      if(colorObject.enableBis) {
        $(`${selectors.singleOptionSelector}[value="${colorObject.color}"]`, this.$container).parent().addClass(classes.bis);
        $(`${selectors.singleOptionSelector}[value="${colorObject.color}"]`, this.$container).siblings('.product-option__ui').append('<span class="product-option__bis-message">Back<br>Soon</span>');
      } else {
        $(`${selectors.singleOptionSelector}[value="${colorObject.color}"]`, this.$container).parent().addClass(classes.soldOut);
      }
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
    let soldOutCount = 0;
    let enableBis = false;

    colorVariants.forEach((variant) => {
      if(!variant.available) {
        soldOutCount++;

        if(variant.metafields.enable_bis) {
          enableBis = true;
        }
        if(variant.metafields.enable_bis || variant.metafields.enable_sold_out) {
          return false;
        }
        unavailableVariantcount++;
      }
    });

    return {
      hideColor: variantCount === unavailableVariantcount,
      soldOutColor: variantCount === soldOutCount,
      enableBis: enableBis
    }
  }

  _disablePurchase(soldOut = false) {
    this.$addToCartBtn.prop('disabled', true);
    this.$priceWrapper.addClass(classes.hide);
    if(soldOut) {
      this.$addToCartBtnText.html(theme.strings.soldOut);
      this.$atcPrice.hide();
    } else {
      this.$addToCartBtnText.html(theme.strings.unavailable);
    }
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

  onBisButtonClick(evt) {
    const $this = $(evt.currentTarget);
    const currentVariant = $this.data('variant-id');

    const selectedVariant = this.productSingleObject.variants.filter((variant) => {
      return variant.id === currentVariant;
    })

    const data = {
      productData: {
        variantId: selectedVariant[0].id,
        productTitle: this.productSingleObject.title,
        image: selectedVariant[0].featured_image.src,
        productOptions: []
      }
    }

    selectedVariant[0].options.forEach((option, index) => {
      data.productData.productOptions.push({
        label: option,
        value: selectedVariant[0][`option${index+1}`]
      })
    });

    const event = $.Event('back-in-stock:open', data)

    $(document).trigger(event);
  }
}
