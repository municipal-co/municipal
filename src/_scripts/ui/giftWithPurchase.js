import $ from 'jquery';
import * as Image from '../core/image';
import * as Utils from '../core/utils';
import * as Currency from '../core/currency';

const selectors = {
  gwpProductId: '[data-gwp-product-id]',
  optionToggler: '[data-gwp-option-toggler]',
  optionTogglerContent: '[data-gwp-option-toggler-content]',
  optionWrapper: '[data-gwp-option-wrapper]',
  optionValue: '[data-gwp-option-value]',
  optionInput: '[data-gwp-option-input]',
  gwpImage: '[data-gwp-image]',
  gwpPrice: '[data-gwp-price]',
  submitGwp: '[data-gwp-add-to-cart]',
  productData: '[data-gwp-product-json]',
}

const classes = {
  active: 'is-active'
}

export default class giftWithPurchase {
  constructor($container) {
    this.name = 'giftWithProduct';
    this.nameSpace = `.${this.name}`;
    this.$container = $container;
    this.$gwpId = $(selectors.gwpProductId, this.$container);
    this.$gwpPrice = $(selectors.gwpPrice, this.$container);
    this.$gwpSubmit = $(selectors.submitGwp, this.$container);
    this.$gwpImage = $(selectors.gwpImage, this.$container);

    this.productJson = JSON.parse($(selectors.productData, this.$container).html());

    $(selectors.optionToggler, this.$container).on('click', this.toggleOption.bind(this));
    $(selectors.optionValue, this.$container).on('click', this.updateOptionValue.bind(this));
    $(selectors.optionInput, this.$container).on('change', this.updateGwpSelection.bind(this));
    this.$gwpSubmit.on('click', this.addGwpToCart.bind(this));

    this.updateGwpSelection();
  }

  toggleOption(e) {
    const $this = $(e.currentTarget);
    const $optionContainer = $this.parents(selectors.optionWrapper);

    if($optionContainer.hasClass(classes.active)){
      this.optionClose($optionContainer);
    } else {
      this.optionOpen($optionContainer);
    }
  }

  updateOptionValue(e) {
    const $this = $(e.currentTarget);
    const $optionContainer = $this.parents(selectors.optionWrapper);
    const $optionInput = $(selectors.optionInput, $optionContainer);
    const $optionTogglerContent = $(selectors.optionTogglerContent, $optionContainer);

    $optionInput.val($this.data('gwp-option-value'));
    $optionInput.trigger('change');

    $optionTogglerContent.html($this.contents().clone());
    this.optionClose($optionContainer);
  }

  updateGwpSelection() {
    const variantOptions = [];
    $(selectors.optionInput, this.$container).each((index, option) => {
      variantOptions.push($(option).val());
    })

    const variantName = variantOptions.join(' / ');
    const selectedVariant = this.productJson.variants.filter((variant) => {
      if(variant.title === variantName) {
        return variant;
      }
    })
    this.$gwpId.val(selectedVariant[0].id);
    this.$gwpImage.attr('src', Image.getSizedImageUrl(selectedVariant[0].featured_image.src, '160x160'));
    this.$gwpPrice.val(Currency.formatMoney(selectedVariant[0].price, theme.moneyFormat));
    if (selectedVariant[0].available) {
      this.$gwpSubmit.text(theme.strings.addToCart);
      this.$gwpSubmit.prop('disabled', false);
    } else {
      this.$gwpSubmit.text(theme.strings.soldOut);
      this.$gwpSubmit.prop('disabled', true);
    }
  }

  optionClose($option) {
    $option.removeClass(classes.active);
  }

  optionOpen($option) {
    $option.addClass(classes.active);
  }

  addGwpToCart() {
    const gwpId = $(selectors.gwpProductId, this.$container).val();

    const event = $.Event('GWP:add', {product_id: gwpId});

    $(window).trigger(event);
  }


}
