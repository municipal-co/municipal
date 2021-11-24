import $ from 'jquery';
import { getPropByString } from '../core/utils';
import CartAPI from '../core/cartAPI';

const selectors = {
  addForm: 'form[action^="/cart/add"]',
  addToCart: '[data-add-to-cart]',
  addToCartText: '[data-add-to-cart-text]',
  freeGiftForm: '[data-free-gift-form]',
};

const $window = $(window);
const $body = $(document.body);

class AJAXFormManager {
  constructor() {
    this.name = 'ajaxFormManager';
    this.namespace = `.${this.name}`;
    this.events = {
      ADD_SUCCESS: `addSuccess${this.namespace}`,
      ADD_FAIL: `addFail${this.namespace}`,
      ADD_FROM_VARIANT_ID: `add_one_from_variant_id`,
      GWP_ADD: 'GWP:add'
    };

    this.requestInProgress = false;

    $body.on('submit', selectors.addForm, this.addToCartFromForm.bind(this));

    $window.on(this.events.ADD_FROM_VARIANT_ID, this.addToCartByVariantID.bind(this));
    $window.on(this.events.GWP_ADD, this.addToCartFreeGift.bind(this));
  }

  addToCartFromForm(e) {
    e.preventDefault();

    if (this.requestInProgress) return;

    const $submitButton = $(e.target).find(selectors.addToCart);
    const $submitButtonText = $submitButton.find(selectors.addToCartText);

    // Update the submit button text and disable the button so the user knows the form is being submitted
    $submitButton.prop('disabled', true);
    $submitButtonText.html(getPropByString(window, 'theme.strings.adding') || 'Adding');

    CartAPI.addItemFromForm($(e.target))
      .then((data) => {
        const event = $.Event(this.events.ADD_SUCCESS, { cart: data });
        $window.trigger(event);
      })
      .fail((data) => {
        const event = $.Event(this.events.ADD_FAIL, { data });
        $window.trigger(event);
      })
      .always(() => {
        // Reset button state
        $submitButton.prop('disabled', false);
        $submitButtonText.html(theme.strings.addToCart);
      });
  }

  addToCartByVariantID(e) {
    if (e.variantID) {
      CartAPI.addItemFromID(e.variantID)
        .then((data) => {
          const event = $.Event(this.events.ADD_SUCCESS, { cart: data });
          $window.trigger(event);
        })
        .fail((data) => {
          const event = $.Event(this.events.ADD_FAIL, { data });
          $window.trigger(event);
        })
    }
  }

  addToCartFreeGift(e) {

    let hasFreeGift = false;

    const productId = e.product_id;

    CartAPI.getCart().then((cart) => {
      cart.items.forEach((item) => {
        if(item.properties.hasOwnProperty('_freeGift')) {
          hasFreeGift = true;
        }
      })

      if(hasFreeGift) {
        const event = $.Event(this.events.ADD_SUCCESS, {cart});
        $window.trigger(event);
      } else {
        CartAPI.addItemFromID(productId, {_freeGift: true}).then((cart) => {
          const event = $.Event(this.events.ADD_SUCCESS, {cart});
          $window.trigger(event);
        });
      }
    })
  }
}

export default new AJAXFormManager();
