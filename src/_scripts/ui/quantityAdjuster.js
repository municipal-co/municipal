import $ from 'jquery';

/**
 * Quantity Adjuster Scripts
 * -----------------------------------------------------------------------------
 * Handles any events associated with the quantity adjuster component
 *
 *  [data-quantity-adjuster]
 *    [data-increment]
 *    input[type="number"]
 *    [data-decrement]
 *
 */

const selectors = {
  adjuster: '[data-quantity-adjuster]',
  increment: '[data-increment]',
  decrement: '[data-decrement]',
  input: 'input[type="number"]'
};

const dataKey = 'quantity-adjuster';

export default class QuantityAdjuster {
  /**
   * Quantity Adjuster Constructor
   *
   * @param {HTMLElement | jQuery} el - element, either matching selectors.adjuster or a child element
   */  
  constructor(el) {
    this.name = 'quantityAdjuster';
    this.namespace = `.${this.name}`;

    this.$el = $(el).is(selectors.adjuster) ? $(el) : $(el).parents(selectors.adjuster);

    if (!this.$el) {
      console.warn(`[${this.name}] - Element required to initialize`);
      return;
    }

    this.$increment = $(selectors.increment, this.$el);
    this.$decrement = $(selectors.decrement, this.$el);
    this.$input     = $(selectors.input, this.$el);

    this.$increment.on('click', this.onIncrementClick.bind(this));
    this.$decrement.on('click', this.onDecrementClick.bind(this));
    this.$input.on('change', this.onInputChange.bind(this));

    this._addMutationObserver(this.$input.get(0));

    this._updateDisabledState();
  }

  _addMutationObserver(el) {
    if (!el) return;

    const config = { attributes: true };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          if (mutation.attributeName === 'max' || mutation.attributeName === 'min') {
            this.onMinMaxAttributeChange();
          }
          else if (mutation.attributeName === 'disabled') {
            this.onDisabledAttributeChange();
          }
        }
      });
    });

    observer.observe(el, config);
  }

  _updateDisabledState() {
    const val = parseInt(this.$input.val());

    if (this.$input.is(':disabled')) {
      this.$increment.prop('disabled', true);
      this.$decrement.prop('disabled', true);
      return;
    }

    if (val === this.getMax() && val === this.getMin()) {
      this.$increment.prop('disabled', true);
      this.$decrement.prop('disabled', true);
    }
    else if (val >= this.getMax()) {
      this.$increment.prop('disabled', true);
      this.$decrement.prop('disabled', false);
    }
    else if (val <= this.getMin()) {
      this.$increment.prop('disabled', false);
      this.$decrement.prop('disabled', true);
    }
    else {
      this.$increment.prop('disabled', false);
      this.$decrement.prop('disabled', false);
    }
  }

  _changeValue(amount) {
    if (this.$input.is(':disabled') || typeof amount === 'undefined') return;

    amount = parseInt(amount);

    const val = parseInt(this.$input.val());
    const newVal = val + amount;

    // Don't change if the value is the same or invalid
    if (newVal === val || newVal > this.getMax() || newVal < this.getMin()) return;

    this.$input.val(newVal);
    this.$input.trigger('change');
  }

  _clampInputVal() {
    const currVal = parseInt(this.$input.val());
    const max = this.getMax();
    const min = this.getMin();

    if (currVal > max) {
      this.$input.val(max);
    }
    else if (currVal < min) {
      this.$input.val(min);
    }
  }

  getMin() {
    return parseInt(this.$input.attr('min')) || 0;
  }

  getMax() {
    return parseInt(this.$input.attr('max')) || 999;
  }

  onDisabledAttributeChange() {
    this._updateDisabledState();
  }

  onMinMaxAttributeChange() {
    this._clampInputVal();
    this._updateDisabledState();
  }

  onInputChange() {
    this._clampInputVal();
    this._updateDisabledState();
  }

  onIncrementClick(e) {
    e.preventDefault();
    this._changeValue(1);
  }

  onDecrementClick(e) {
    e.preventDefault();
    this._changeValue(-1);
  }

  static ensure(el) {
    let $el =  $(el);

    if (!$el.is(selectors.adjuster)) {
      $el = $el.parents(selectors.adjuster);
    }

    let data = $el.data(dataKey);

    if (!data) {
      $el.data(dataKey, (data = new QuantityAdjuster($el)));
    }

    return data;
  }

  static refresh($container) {
    $(selectors.adjuster, $container).each((i, el) => {
      QuantityAdjuster.ensure(el);
    });
  }

  static getDataKey() {
    return dataKey;
  }
}

const shopifyEvents = [
  'shopify:section:unload',
  'shopify:section:select',
  'shopify:section:deselect',
  'shopify:section:reorder',
  'shopify:block:select',
  'shopify:block:deselect'
];

$(document).on(shopifyEvents.join(' '), QuantityAdjuster.refresh);

QuantityAdjuster.refresh();
