import $ from 'jquery';
import Swiper, { Scrollbar, Navigation } from 'swiper';
import Cookies from 'js-cookie';
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
  // Final sale messaging
  finalSaleMessaging: '[data-final-sale-message]',
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
    this.$finalSaleMessaging     = $(selectors.finalSaleMessaging, this.$container);
    /* eslint-enable */
    this.optionDrawers = this._setUpOptionDrawers();
    this.productSingleObject  = JSON.parse($(selectors.productJson, this.$container).html());
    this.searchParams = new URLSearchParams(document.location.search);
    this.variants = new Variants({
      $container: this.$detailOptions,
      enableHistoryState: this.settings.enableHistoryState,
      singleOptionSelector: selectors.singleOptionSelector,
      originalSelectorId: selectors.originalSelectorId,
      product: this.productSingleObject
    });

    this.$container.on('variantChange', this.onVariantChange.bind(this));
    this.$shippingModalTrigger.on(this.events.CLICK, this.openShippingModal.bind(this));
    this.$pdpDrawerToggler.on(this.events.CLICK, this._toggleOptionDrawer.bind(this));
    Utils.chosenSelects(this.$container);
    this.productBundles = new ProductBundles(this.$container, this.productSingleObject);
    this.$singleOptionSelectors.on(this.events.CHANGE, this.onOptionChange.bind(this));
    this.$bisButton.on(this.events.CLICK, this.onBisButtonClick.bind(this));
    this.productColorValidation();
    if(this.$swatchSlider.length){
      this.initSwatchesSlider();
    }
    this.updateAddToCartState(this.variants.currentVariant);
    this.updateProductPrices(this.variants.currentVariant, true);
    document.addEventListener('sizeOption:changeUnit', this.validateSizeAvailability.bind(this));
    Cookies.set('findify-rid', this.searchParams.get('rid'));
  }

  onVariantChange(evt) {
    const variant = evt.variant;

    this.updateProductPrices(variant);
    this.updateAddToCartState(variant);
    this.updateQuantitySelect(variant);
    this.updateVariantOptionValues(variant);
    this.updateFullDetailsLink(variant);
    this.updateKlarnaPricing(variant);
    this.productColorValidation();
    this.finalSaleValidation(variant);
    this.settings.onVariantChange(variant);
  }

  onOptionChange(evt) {
    const $this = $(evt.currentTarget);
    const optionIndex = $this.data('product-option');
    const optionValue = $this.val();
    const optionName = $this.data('option-name');
    this.updateSelectedOptionLabel(optionIndex, optionValue, optionName);
  }

  initSwatchesSlider() {
    let currentSlide = 0;
    this.$swatchSlider.each((i, slider) => {
      const $slider = $(slider);
      const $swatchSlides = $(selectors.swatchSlide, $slider);

      $swatchSlides.each((index, slide) => {
        const input = slide.querySelector('[data-single-option-selector]');
        if(input.dataset.variantComparePrice) {
          const discountValue = 100 - (input.dataset.variantPrice / input.dataset.variantComparePrice * 100);
          let badgeClass = 'discount-badge--first-threshold';

          if(discountValue >= 70) {
            badgeClass = 'discount-badge--third-threshold';
          } else if(discountValue >= 50) {
            badgeClass = 'discount-badge--second-threshold';
          }

          slide.querySelector('.product-option__discount-badge').classList.add(badgeClass);
        }
      })

      $swatchSlides.each((index, el) => {
        if($(el).find('input[type=radio]:checked').length) {
          currentSlide = index;
          return false;
        }
      })

      this.swatchSlider = new Swiper(this.$swatchSlider.get(0), {
        modules: [Scrollbar, Navigation],
        slide: selectors.swatchSlide,
        slidesPerView: 4.7,
        spaceBetween: 8,
        threshold: 10,
        initialSlide: $swatchSlides.length <= 4 ? 0 : currentSlide,
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
      } else if ($(el).is('select') && $(el).is('.edited') && $(el).val() !== '') {
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
      this.$addToCartBtnText.html(theme.strings.soldOut);
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
        this.$addToCartBtnText.html(theme.strings.soldOut);
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
    if (variant !== null && typeof variant !== 'undefined') {
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
      let updatedValue = value === 'OS' ? 'One Size' : value;

      if(this.productSingleObject.tags?.find((tag) => tag.toLowerCase() === 'footwear')) {
        updatedValue = Utils.transformFootwearSizes(updatedValue, this.productSingleObject.tags);
      }

      $(`[data-selected-option=${index}]`, this.$detailOptions).html(`Selected ${name}: <span class="product-option__drawer-btn-value">${updatedValue.replace('.00', '')}</span>`);
      $(`[data-selected-option=${index}]`, this.$detailOptions).parent().addClass('is-active');
      this.validateSizeAvailability.call(this, $(`[data-option-value="${value.toLowerCase()}"]`).parent());
    } else {
      $(`[data-selected-option=${index}]`, this.$detailOptions).text(value);
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
    if(typeof currentOption === 'undefined' || currentOption?.type !== undefined) {
      $currentOption = $(`[data-product-option=${colorIndex}]:checked`, this.$detailOptions).parent();
    }

    const $selectedSize = $(`[data-product-option=${sizeIndex}]`, this.$detailOptions).val();

    if($currentOption.is('.is-bis')) {
      $(`[data-selected-option=${sizeIndex}]`).text('Notify me when back');
      this._disablePurchase(true);
    } else if ($currentOption.is('.is-sold-out')) {
      $(`[data-selected-option=${sizeIndex}]`).parent().prop('disabled', true);
      this._disablePurchase(true)
    } else if($selectedSize.length) {
      let optionValue = $selectedSize === 'OS' ? 'One Size' : $selectedSize;

      if(this.productSingleObject.tags?.find((tag) => tag.toLowerCase() === 'footwear')) {
        optionValue = Utils.transformFootwearSizes(optionValue, this.productSingleObject.tags);
      }

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
      if(data.success === true) {
        this.$bisForm.addClass(classes.submitted);
        this.$bisResponseMessage.text(successMessage);
        setTimeout(() => {
          this.$bisForm.removeClass(classes.submitted);
        }, 5000);
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
      };

      if(colorState.soldOutColor && !colorState.hideColor) {
        soldOutColors.push({
          color: color,
          enableBis: colorState.enableBis
        });
      }
    });

    colorsToHide.forEach((color) => {
      $(`${selectors.singleOptionSelector}[value="${color}"]`, this.$container).parent().removeAttr('swiper-slide').hide();
    })

    soldOutColors.forEach((colorObject) => {
      $(`${selectors.singleOptionSelector}[value="${colorObject.color}"]`, this.$container).parent().addClass(classes.soldOut);
    })
  }

  finalSaleValidation(variant) {
    if(!variant) return false;

    if(this.$finalSaleMessaging.length === 0) {
      return false;
    }

    if(variant.metafields.enable_final_sale === true) {
      this.$finalSaleMessaging.attr('name', 'properties[Final Sale]')
    } else {
      this.$finalSaleMessaging.removeAttr('name');
    }

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

  _buildDrawerData($button) {
    const $optionField = $button.siblings('[data-single-option-selector]');
    const currentOptionIndex = $optionField.data('index');
    const fitGuideSettings = !!document.querySelector('[data-fit-guide-settings]');
    const productOptions = [];
    const drawerData = {
      optionIndex: currentOptionIndex,
      printOption: $optionField.data('option-name'),
      productTitle: this.productSingleObject.title,
      addToCart: false,
      optionsWithValues: this.productSingleObject.options_with_values,
      dataField: $optionField.get(0),
      activeOption: $optionField.is('.edited') ? $optionField.val() : '',
      tags: this.productSingleObject.tags || [],
      fitTipsContent: this.productSingleObject.metafields.fit_tips_content || undefined,
      fitTipsTitle: this.productSingleObject.metafields.fit_tips_title || undefined,
      showSizing: fitGuideSettings,
      productUrl: '//' + window.location.host + '/products/' + this.productSingleObject.handle + '?variant=' + this.variants.currentVariant.id + '#fitGuide'
    }

    for(let i = 1; i <= 3; i++) {
      let option = $(`[data-single-option-selector][data-index=option${i}]:checked`, this.$detailOptions);

      if (option.length === 0) {
        option = $(`[data-single-option-selector][data-index=option${i}]`, this.$detailOptions)
      }

      if(option.length === 1) {
        productOptions.push({
          index: option.data('index'),
          value: option.val()
        });
      }
    }

    const otherOptions = productOptions.filter(option => {
      return option.index !== currentOptionIndex
    });
    let filteredVariants = this.productSingleObject.variants;

    otherOptions.forEach((option) => {
      filteredVariants = filteredVariants.filter(variant => {
        return variant[option.index] === option.value
      });
    })

    drawerData.variants = filteredVariants;

    return drawerData;
  }

  _toggleOptionDrawer(evt) {
    const $this = $(evt.currentTarget);

    const drawerData = this._buildDrawerData($this);

    document.dispatchEvent(new CustomEvent('drawerOpen', {detail: {
      type: 'option-drawer',
      ...drawerData
    }}))
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