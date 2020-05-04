import $ from 'jquery';
import Handlebars from 'handlebars';
import * as Utils from '../core/utils';
import CartAPI from '../core/cartAPI';
import QuantityAdjuster from './quantityAdjuster';

const $window = $(window);
const $body = $(document.body);

const selectors = {
  container: '[data-ajax-cart-container]',
  bodyTemplate: 'script[data-ajax-cart-body-template]',
  footerTopTemplate: 'script[data-ajax-cart-footer-top-template]',
  trigger: '[data-ajax-cart-trigger]',
  close: '[data-ajax-cart-close]',
  body: '[data-ajax-cart-body]',
  footer: '[data-ajax-cart-footer]',
  footerTop: '[data-ajax-cart-footer-top]',
  item: '[data-ajax-item][data-key][data-qty]',
  itemRemove: '[data-ajax-cart-item-remove]',
  itemQuantityInput: '[data-ajax-cart-body] input[type="number"]',
  quantityAdjuster: '[data-quantity-adjuster]',
  cartBadge: '[data-cart-badge]',
  cartBadgeCount: '[data-cart-badge-count]'
};

const classes = {
  bodyCartOpen: 'ajax-cart-open',
  backdrop: 'ajax-cart-backdrop',
  backdropVisible: 'is-visible',
  cartOpen: 'is-open',
  cartBadgeHasItems: 'has-items',
  cartIsEmpty: 'is-empty',
  lockUI: 'lock-ui'
};

export default class AJAXCart {
  /**
   * AJAXCart constructor
   *
   * @param {Object} templateData - Merged with the cart object when rendering the handlebars template
   */
  constructor(templateData = {}) {
    this.name = 'ajaxCart';
    this.namespace = `.${this.name}`;

    // UPDATE_AND_OPEN is the only event that isn't emitted, we just listen for it.
    // It allows other parts of the application to trigger the drawer to open

    this.events = {
      CLICK:   `click${this.namespace}`,
      CHANGE:  `change${this.namespace}`,
      RENDER:  `render${this.namespace}`,
      DESTROY: `destroy${this.namespace}`,
      UPDATE_AND_OPEN: `updateAndOpen${this.namespace}`
    };

    this.settings = {
      backdrop: true
    };

    this.templateData = templateData;
    
    this.$el                = $(selectors.container);
    this.$acBody            = $(selectors.body, this.$el);
    this.$acFooter          = $(selectors.footer, this.$el);
    this.$acFooterTop       = $(selectors.footerTop, this.$el);
    this.$bodyTemplate      = $(selectors.bodyTemplate);
    this.$footerTopTemplate = $(selectors.footerTopTemplate);
    this.$cartBadge         = $(selectors.cartBadge);
    this.$cartBadgeCount    = $(selectors.cartBadgeCount);

    this.$backdrop            = null;
    this.stateIsOpen          = null; // Store visibilty state of the cart so we dont' have to query DOM for a class name
    this.hasBeenRendered      = false; // Lock to prevent displaying the cart before anything has been rendered
    this.qaInteractionTimeout = null;
    this.qaInteractionDelay   = 350; // Delay before triggering the quantityadjuster change event (allows user to increment / decrement quickly)
    this.transitionEndEvent   = Utils.whichTransitionEnd();


    if (!this.$bodyTemplate.length || !this.$footerTopTemplate.length) {
      console.warn(`[${this.name}] - Handlebars template required to initialize`);
      return;
    }

    // Compile this once during initialization
    this.bodyTemplate      = Handlebars.compile(this.$bodyTemplate.html());
    this.footerTopTemplate = Handlebars.compile(this.$footerTopTemplate.html());

    if (Utils.isThemeEditor()) {
      this.$el.find('.additional-checkout-button').parent('.ajax-cart__footer-row').remove();
    }

    // Add event handlers here
    $body.on(this.events.CLICK, selectors.trigger, this.onTriggerClick.bind(this));
    $body.on(this.events.CLICK, selectors.close, this.onCloseClick.bind(this));
    $body.on(this.events.CLICK, selectors.itemRemove, this.onItemRemoveClick.bind(this));
    $body.on(this.events.CHANGE, selectors.itemQuantityInput, this.onItemQuantityInputChange.bind(this));
    $window.on(this.events.RENDER, this.onRender.bind(this));
    $window.on(this.events.DESTROY, this.onDestroy.bind(this));
    $window.on(this.events.UPDATE_AND_OPEN, this.onUpdateAndOpen.bind(this));
  }

  destroy() {
    this.$backdrop && this.$backdrop.remove(); // Don't use this.removeBackdrop because we can't wait for the animation to complete
    $body.off(this.events.CLICK);
    $body.off(this.events.CLICK);
    $window.off(this.events.RENDER);
    $window.off(this.events.DESTROY);
    $window.off(this.events.UPDATE_AND_OPEN);
  }

  /**
   * Ensure we are working with a valid number
   *
   * @param {int|string} qty
   * @return {int} - Integer quantity.  Defaults to 1
   */
  validateQty(qty) {
    return (parseFloat(qty) === parseInt(qty)) && !Number.isNaN(qty) ? qty : 1;
  }

  /**
   * Get data about the cart line item row
   *
   * @param {element} el - cart line item row or child element
   * @return {obj}
   */
  getItemRowAttributes(el) {
    const $el = $(el);
    const $row = $el.is(selectors.item) ? $el : $el.parents(selectors.item);

    return {
      $row: $row,
      key: $row.data('key'),
      line: $row.index() + 1,
      qty: this.validateQty($row.data('qty'))
    };
  }

  /**
   * Add a class to lock the cart UI from being interacted with
   *
   * @return this
   */
  lockUI() {
    this.$el.addClass(classes.lockUI);
    return this;
  }

  /**
   * Removes a class to unlock the cart UI
   *
   * @return this
   */
  unlockUI() {
    this.$el.removeClass(classes.lockUI);
    return this;
  }

  /**
   * Builds the HTML for the ajax cart and inserts it into the container element
   *
   * @param {object} cart - JSON representation of the cart.  See https://help.shopify.com/themes/development/getting-started/using-ajax-api#get-cart
   * @return this
   */
  render(cart) {
    const templateData = $.extend(this.templateData, cart);

    $window.trigger($.Event(this.events.DESTROY));
    this.$acBody.empty().append(this.bodyTemplate(templateData));
    this.$acFooterTop.empty().append(this.footerTopTemplate(templateData));
    $window.trigger($.Event(this.events.RENDER, { cart }));

    return this;
  }

  /**
   * Update the cart badge + count here
   *
   * @param {Object} cart - JSON representation of the cart.
   * @return this
   */
  updateCartCount(cart) {
    this.$cartBadgeCount.html("("+cart.item_count+")");

    if (cart.item_count) {
      this.$cartBadge.addClass(classes.cartBadgeHasItems);
    }
    else {
      this.$cartBadge.removeClass(classes.cartBadgeHasItems);
    }

    return this;
  }

  addBackdrop(callback) {
    const cb = callback || $.noop;

    if (this.stateIsOpen) {
      this.$backdrop = $(document.createElement('div'));

      this.$backdrop.addClass(classes.backdrop).appendTo($body);

      this.$backdrop.one(this.transitionEndEvent, cb);
      this.$backdrop.one('click', this.close.bind(this));

      // debug this...
      setTimeout(() => {
        this.$backdrop.addClass(classes.backdropVisible);
      }, 10);
    }
    else {
      cb();
    }
  }

  removeBackdrop(callback) {
    const cb = callback || $.noop;

    if (!this.stateIsOpen && this.$backdrop) {
      this.$backdrop.one(this.transitionEndEvent, () => {
        this.$backdrop && this.$backdrop.remove();
        this.$backdrop = null;
        cb();
      });

      setTimeout(() => {
        this.$backdrop.removeClass(classes.backdropVisible);
      }, 10);
    }
    else {
      cb();
    }
  }

  /**
   * Called whenever the `updateAndOpen.ajaxCart` window event is triggered
   * Only method that can be triggered from other parts of the application (outside of sections/ajaxCart)
   *
   */
  onUpdateAndOpen() {
    CartAPI.getCart().then((cart) => {
      this.render(cart);
      this.open();
    });
  }

  /**
   * Callback when changing a cart quantity is successful
   *
   * @param {Object} cart - JSON representation of the cart.
   */
  onChangeSuccess(cart) {
    this.render(cart).open();
  }

  /**
   * STUB - Callback when changing a cart quantity fails
   *
   * @param {Object} data
   * @param {String} data.message - error message
   */
  onChangeFail(data) {
    console.warn(`[${this.name}] - onChangeFail`);
    console.warn(`[${this.name}] - ${data.message}`);
  }

  /**
   * Callback for when the cart HTML is rendered to the page
   * Allows us to add event handlers for events that don't bubble
   */
  onRender(e) {
    if (e.cart) {
      this.updateCartCount(e.cart);

      if (e.cart.item_count === 0) {
        this.$el.addClass(classes.cartIsEmpty);
      }
      else {
        this.$el.removeClass(classes.cartIsEmpty);
      }
    }

    QuantityAdjuster.refresh(this.$el);

    // Just in case
    this.unlockUI();
    this.hasBeenRendered = true;
  }

  /**
   * Callback for when the cart HTML is removed from the page
   * Allows us to do cleanup on any event handlers added in this.onRender
   */
  onDestroy(e) {

  }

  /**
   * Remove the item from the cart.  Extract this into a separate method if there becomes more ways to delete an item
   *
   * @param {event} e - Click event
   */
  onItemRemoveClick(e) {
    e.preventDefault();

    const attrs = this.getItemRowAttributes(e.target);

    this.lockUI();

    CartAPI.changeLineItemQuantityByKey(attrs.key, 0).then((cart) => {
      this.render(cart);
    })
      .fail(() => {
        console.warn('something went wrong...');
      })
      .always(() => {
        this.unlockUI();
      });
  }

  /**
   * Triggered when someone changes the value of the quantity input through the quantity adjuster
   * We tap into the quantityAdjuster instance through the data attribute to retrieve the normalized max / min 
   * (in case they don't exist as html attributes) and adjust the interaction timeout accordingly
   *
   * @param {event} e - Change event
   */
  onItemQuantityInputChange(e) {
    const attrs      = this.getItemRowAttributes(e.target);
    const $input     = $(e.currentTarget);
    const $qa        = $input.closest(selectors.quantityAdjuster);
    const qaInstance = $qa.data(QuantityAdjuster.getDataKey());
    const qty        = $input.val();

    let d = this.qaInteractionDelay;

    // If we hit the max or min on the input, trigger the quantity update request immediately;
    if (qaInstance && (qaInstance.getMax() === qty || qaInstance.getMin() === qty)) {
      d = 0;
    }

    clearTimeout(this.qaInteractionTimeout);
    this.qaInteractionTimeout = setTimeout(() => {
      this.lockUI();

      CartAPI.changeLineItemQuantityByKey(attrs.key, qty).then((cart) => {
        this.render(cart);
      })
        .fail(() => {
          console.warn('something went wrong...');
        })
        .always(() => {
          this.unlockUI();
        });
    }, d);
  }

  /**
   * Click the 'ajaxCart - trigger' selector
   *
   * @param {event} e - Click event
   */
  onTriggerClick(e) {
    e.preventDefault();
    
    // If we haven't rendered the cart yet, don't show it
    if (!this.hasBeenRendered) {
      return;
    }

    this.toggleVisibility();
  }

  /**
   * Click the 'ajaxCart - close' selector
   *
   * @param {event} e - Click event
   */
  onCloseClick(e) {
    e.preventDefault();
    this.close();
  }

  /**
   * Opens / closes the cart depending on state
   *
   */
  toggleVisibility() {
    return this.stateIsOpen ? this.close() : this.open();
  }

  /**
   * Opens the cart and adds the backdrop if necessary
   *
   */
  open() {
    if (this.stateIsOpen) return;

    this.stateIsOpen = true;

    if (this.settings.backdrop) {
      $body.addClass(classes.bodyCartOpen);
      this.addBackdrop();
    }

    this.$el.addClass(classes.cartOpen);
  }

  /**
   * Closes the cart and removes the backdrop if necessary
   *
   */
  close() {
    if (!this.stateIsOpen) return;

    this.stateIsOpen = false;

    this.$el.removeClass(classes.cartOpen);

    if (this.settings.backdrop) {
      this.removeBackdrop(() => {
        $body.removeClass(classes.bodyCartOpen);
      });
    }
  }
}
