import $ from 'jquery';
import BaseSection from './base';
import Drawer from '../ui/drawer';

const selectors = {
  bisContainer: '[data-drawer]',
  bisForm: '[data-bis-form]',
  bisButton: '[data-bis-button]',
  bisToggler: '[data-bis-toggler]',
  bisProductTitle: '[data-bis-product-name]',
  bisVariantColor: '[data-bis-variant-color]',
  bisVariantSize: '[data-bis-variant-size]',
  bisVariantId: '[data-bis-variant-id]',
  bisFeaturedImage: '[data-bis-featured-image]',
  bisEmailInput: '[data-bis-email-input]',
  bisResponseMessage: '[data-bis-response-message]',
}

const classes = {
  submitted: 'submitted'
}

export default class BisDrawer extends BaseSection {
  constructor(container) {
    super( container, 'bis-drawer');
    this.events = {
      OPEN: 'back-in-stock:open',
      SUBMIT: 'submit',
    }

    this.$bisDrawer              = $(selectors.bisContainer, this.$container);
    this.$bisFeaturedImage       = $(selectors.bisFeaturedImage, this.$container);
    this.$bisProductTitle        = $(selectors.bisProductTitle, this.$container);
    this.$bisVariantColor        = $(selectors.bisVariantColor, this.container);
    this.$bisVariantSize         = $(selectors.bisVariantSize, this.container);
    this.$bisForm                = $(selectors.bisForm, this.$container);
    this.$bisEmailInput          = $(selectors.bisEmailInput, this.$bisForm);
    this.$bisVariantId           = $(selectors.bisVariantId, this.$bisForm);
    this.$bisResponseMessage     = $(selectors.bisResponseMessage, this.$container);

    this.drawer = new Drawer(this.$bisDrawer);


    // Event listeners
    $(window).on(this.events.OPEN, this.updateDrawerData.bind(this));
    this.$bisForm.on(this.events.SUBMIT, this.onBisSubmit.bind(this));
  }

  updateDrawerData(evt) {
    const productData = evt.productData;

    if(!productData.variantId) {
      console.log(`[${this.name}] - Variant ID is required to trigger the Back in stock modal`);
      return false;
    }

    this.$bisVariantId.val(productData.variantId);
    this.$bisProductTitle.text(productData.productTitle);
    this.$bisFeaturedImage.attr('src', productData.image);

    productData.productOptions.forEach((option) => {
      const optionLabelLowcase = option.label.toLowerCase();
      if(optionLabelLowcase === 'color') {
        this.$bisVariantColor.text(option.value)
      }
      if(optionLabelLowcase === 'size') {
        if(option.value === 'OS') {
          this.$bisVariantSize.text('Only Size');
        } else {
          this.$bisVariantSize.text(option.value);
        }
      }
    })

    this.drawer.show();
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
      } else {
        this.$bisForm.addClass(classes.submitted);
        this.$bisResponseMessage.text(errorMessage);
      }

      setTimeout(() => {
        this.$bisForm.removeClass(classes.submitted);
      }, 5000);
    })
  }
}
