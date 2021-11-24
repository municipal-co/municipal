import $ from 'jquery';
import * as Currency from './currency';
import * as Image from './image';
import AJAXFormManager from '../managers/ajaxForm';

class CartAPI {
  constructor() {
    this.name = 'cartAPI';
    this.cart = {}; // Keep a reference to the cart at all times - this can either be the default shopify JSON representation for our custom one

    this.getCart(); // Fetches the latest cart and updates this.cart;
  }

  /**
   * Formats the cart object to be consumed by the handlebars template
   *
   * @param {object} cart - JSON representation of the cart.  See https://help.shopify.com/themes/development/getting-started/using-ajax-api#get-cart
   * @return {object}
   */
  formatCart(cart) {
    if (cart && cart.is_formatted) {
      return cart;
    }
    if(typeof theme.giftWithPurchase !== 'undefined') {
      if (cart.total_price >= theme.giftWithPurchase.giftThreshold) {
        cart.show_gwp_ui = true;
      } else {
        cart.show_gwp_ui = false;
      }
    }

    // Make adjustments to the cart object contents before we pass it off to the handlebars template
    cart.unformatted_price = cart.total_price;
    cart.total_price = Currency.formatMoney(cart.total_price, theme.moneyFormat);
    cart.total_price = Currency.stripZeroCents(cart.total_price);
    cart.items.map((item) => {
      if (item.image) {
        item.image = Image.getSizedImageUrl(item.image, '200x');
      }
      item.price = Currency.formatMoney(item.price, theme.moneyFormat);
      item.price = Currency.stripZeroCents(item.price);
      item.original_price = Currency.formatMoney(item.original_price, theme.moneyFormat);
      item.original_price = Currency.stripZeroCents(item.original_price);

      // Adjust the item's variant options to add "name" and "value" properties
      if (item.hasOwnProperty('product')) {
        const product = item.product;

        for (let i = item.variant_options.length - 1; i >= 0; i--) {
          const name  = product.options[i];
          const value = item.variant_options[i];

          item.variant_options[i] = { name, value };

          // Don't show this info if it's the default variant that Shopify creates
          if (value === 'Default Title') {
            delete item.variant_options[i];
          }
        }
      }
      else {
        delete item.variant_options; // skip it and use the variant title instead
      }

       // Cart has free gift already
       if (item.properties.hasOwnProperty('_freeGift')) {
        cart.show_gwp_ui = false;
        item.is_free_gift = true;
      }

      return item;
    });

    cart.is_formatted = true;

    return cart;
  }

  /**
   * Gets the index of the cart line item based on the line item key
   * This is helpful because the line item changes any time products are added or removed from the cart whereas the key does not
   * The issue is that the actual Shopify AJAX API relies on index to make cart modifications.
   * Use this method to retrieve the line index immediately before making cart changes.
   *
   * @param {String} key - line_item.key
   * @return {Integer} line
   */
  getCartLineByItemKey(key) {
    if (Object.keys(this.cart).length === 0) {
      console.warn(`[${this.name}] - this.cart data required to pull line item by key`);
    }

    let line;

    for (let i = this.cart.items.length - 1; i >= 0; i--) {
      if (key === this.cart.items[i].key) {
        line = i+1;
        break;
      }
    }

    return line;
  }

  /**
   * Retrieve a JSON respresentation of the users cart
   *
   * @return {Promise} - JSON cart
   */
  getCart() {
    const promise = $.Deferred();

    $.ajax({
      type: 'get',
      url: '/cart?view=json',
      success: (data) => {
        // Theme editor adds HTML comments to JSON response, strip these
        data = data.replace(/<\/?[^>]+>/gi, '');
        let cart = JSON.parse(data);

        const newCart = this.validateGiftThreshold(cart);

        cart = newCart;

        this.cart = this.formatCart(cart);

        promise.resolve(this.cart);
      },
      error: () => {
        promise.reject({
          message: 'Could not retrieve cart items'
        });
      }
    });

    return promise;
  }

  /**
   * AJAX submit an 'add to cart' form
   *
   * @param {jQuery} $form - jQuery instance of the form
   * @return {Promise} - Resolve returns JSON cart | Reject returns an error message
   */
  addItemFromForm($form) {
    let promise = $.Deferred();

    const bundleSelection = this.validateBundleSelection($form);
    if(bundleSelection !== false) {
      promise = this.addMultipleItems(bundleSelection);
    } else {
      $.ajax({
        type: 'post',
        dataType: 'json',
        url: '/cart/add.js',
        data: $form.serialize(),
        success: () => {
          this.getCart().then((cart) => {
            promise.resolve(cart);
          });
        },
        error: () => {
          promise.reject({
            message: 'The quantity you entered is not available.'
          });
        }
      });
    }

    return promise;
  }

   /**
   * AJAX submit an 'add to cart' form
   *
   * @param {jQuery} $form - jQuery instance of the form
   * @return {Promise} - Resolve returns JSON cart | Reject returns an error message
   */
  addItemFromID(id, properties) {
    const promise = $.Deferred();

    $.ajax({
      type: 'post',
      dataType: 'json',
      url: '/cart/add.js',
      data: { quantity: 1, id: id, properties },
      success: () => {
        this.getCart().then((cart) => {
          promise.resolve(cart);
        });
      },
      error: () => {
        promise.reject({
          message: 'The quantity you entered is not available.'
        });
      }
    });

    return promise;
  }

  /**
   * AJAX submit multiple items  within one 'add to cart' request
   *
   * @param {jQuery} items - array of product items following shopify cart api
   * @return {Promise} - Resolve returns JSON cart | Reject returns an error message
   */

  addMultipleItems(items) {
    const promise = $.Deferred();

    $.ajax({
      type: 'post',
      dataType: 'json',
      url: '/cart/add.js',
      data: { quantity: 1, id: id, properties: properties},
      success: () => {
        this.getCart().then((cart) => {
          promise.resolve(cart);
        });
      },
      error: () => {
        promise.reject({
          message: 'One or more of the items added is not available.'
        });
      }
    });

    return promise;
  }


  /**
   * Retrieve a JSON respresentation of a specific product
   *
   * @return {Promise} - JSON product
   */
  getProduct(handle) {
    return $.getJSON(`/products/${handle}.js`);
  }

  /**
   * Change the quantity of an item in the users cart
   * Item is specified by line_item index (Shopify index which starts at 1 not 0)
   *
   * @param {Integer} line - Cart line
   * @param {Integer} qty - New quantity of the variant
   * @return {Promise} - JSON cart
   */
  changeLineItemQuantity(line, qty) {
    const promise = $.Deferred();

    $.ajax({
      type: 'post',
      dataType: 'json',
      url: '/cart/change.js',
      data: `quantity=${qty}&line=${line}`,
      success: (cart) => {
        this.cart = cart;
        this.getCart().then((data) => {
          promise.resolve(data);
        });
      },
      error: () => {
        const data = {
          message: 'Something went wrong. With the line'
        };
        promise.reject(data);
      }
    });

    return promise;
  }

  /**
   * Change the quantity of an item in the users cart
   * Item is specified by line_item.key
   *
   * @param {String} key - Line item key
   * @param {Integer} qty - New quantity for the line item
   * @return {Promise} - JSON cart
   */
  changeLineItemQuantityByKey(key, qty) {
    return this.changeLineItemQuantity(this.getCartLineByItemKey(key), qty);
  }

  validateBundleSelection($form) {
    const $bundleSelectors = $form.find('[data-bundle-product-item]');
    const $activeBundleSelectors = $bundleSelectors.filter((index, el) => {
      if($(el).is(':visible')) return true;
    })
    const bundleId = Date.now();
    const itemsObject = [];

    $activeBundleSelectors.each((index, el) => {
      itemsObject.push({
        id: $(el).find('[data-bundle-product-id]').val(),
        quantity: 1,
        properties: {
          _bundleId: bundleId
        }
      })
    })

    if(!$activeBundleSelectors.length) {
      return false;
    };

    return itemsObject;
  }

  validateGiftThreshold(cart) {
    let hasFreeGift = false;
    let freeGiftIndex = -1;
    let itemsArrayIndex = -1;
    const freeGiftEnabled = theme.hasOwnProperty('giftWithPurchase');
    let removeFreeGift = false;

    cart.items.forEach((item, index) => {
      if(item.properties.hasOwnProperty('_freeGift')) {
        hasFreeGift = true;
        itemsArrayIndex = index;
        freeGiftIndex = index + 1;
      }
    })

    if(freeGiftEnabled === true) {
      const giftThreshold = theme.giftWithPurchase.giftThreshold;
      if(cart.total_price < giftThreshold) {
        removeFreeGift = true;
      }
    } else {
      removeFreeGift = true;
    }

    if(removeFreeGift && hasFreeGift) {
      this.changeLineItemQuantity(freeGiftIndex, 0).then((newCart)=>{
        const event = $.Event(AJAXFormManager.events.ADD_SUCCESS, {cart: newCart});
        $(window).trigger(event);
      })
    }

    return cart;
  }
}

export default new CartAPI();
