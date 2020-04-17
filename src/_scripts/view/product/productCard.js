import $ from 'jquery';
import CartAPI from '../../core/cartAPI';

const selectors = {
  el: '[data-product-card]',
  gallery: '[data-product-card-gallery]',
  mainLazyImg: '[data-product-card-main-lazy]',
  altLazyImg: '[data-product-card-alt-lazy]',
  productJson: '[data-product-json]',
  variantMessage: '[data-variant-message]',
  dot: '[data-dot]',
  variantOptionList: '[data-variant-option-list]'
};

const classes = {
  mainLoaded: 'is-loaded',
  altLoaded: 'alt-loaded', // added to the product card once the alt image is loaded to avoid a flash of white while loading
  active: 'is-active'
};

const $window = $(window);

export default class ProductCard {
  /**
   * Product Card constructor
   *
   * @param {HTMLElement | $} el - The card element
   */
  constructor(el) {
    this.name = 'productCard';
    this.namespace = `.${this.name}`;

    this.events = {
      MOUSEENTER: `mouseenter${this.namespace}`,
      MOUSELEAVE: `mouseleave${this.namespace}`,
      CLICK: `click${this.namespace}`,
      ADD_SUCCESS: `addSuccess${this.namespace}`,
      ADD_FAIL: `addFail${this.namespace}`,
      UPDATE_AND_OPEN: 'updateAndOpen'
    };

    this.$el = $(el);
    this.$dot = $(selectors.dot, this.$el);
    this.productData = JSON.parse($(selectors.productJson).html());
    this.$variantMessage = $(selectors.variantMessage, this.$el);
    this.lowInventoryThreshold = $(selectors.variantOptionList).data('low-inventory-threshold');

    if (this.$el === undefined || !this.$el.is(selectors.el)) {
      console.warn(`[${this.name}] - Element matching ${selectors.el} required to initialize.`);
      return;
    }

    this.$mainLazyImg = $(selectors.mainLazyImg, this.$el);
    this.$altLazyImg  = $(selectors.altLazyImg, this.$el);

    // Unveil plugin to lazy load main product card images
    this.$mainLazyImg.unveil(200, function() {
      const $img = $(this);
      $img.on('load', () => {
        $img.parents(selectors.gallery).addClass(classes.mainLoaded);
      });
    });

    if (this.$altLazyImg.length) {
      this.$el.one(this.events.MOUSEENTER, this.onMouseenter.bind(this));
    }

    this.$dot.on(this.events.MOUSEENTER, this.onDotMouseenter.bind(this));
    this.$dot.on(this.events.MOUSELEAVE, this.onDotMouseleave.bind(this));
    this.$dot.on(this.events.CLICK, this.onDotClick.bind(this));
  }

  onDotClick(e) {
    const $el = $(e.currentTarget);
    const variantId = $el.data('variant-id');
    console.log('dot click');
    if (!$el.is('[disabled]')) {
      CartAPI.addItemFromID(variantId)
      .then((data) => {
        const event = $.Event( this.events.UPDATE_AND_OPEN, { cart: data });
        $window.trigger(event);
      })
      .fail((data) => {
        alert(data.message);
      })
    }
  }

  onDotMouseenter(e) {
    const $el = $(e.currentTarget);
    const variantId = $el.data('variant-id');
    const self = this;

    $el.addClass(classes.active);

    $.each(this.productData.variants, function(index, variant) {
      if (variant.id === variantId) {
        const availability = variant.available;
        const inventoryQuantity = variant.inventory_quantity;

        if (availability === false) {
          self.$variantMessage.text('Out of Stock');
        } else if (inventoryQuantity <= self.lowInventoryThreshold) {
          self.$variantMessage.text(`Only ${inventoryQuantity} Left`);
        } else {
          self.$variantMessage.text('Quick Add to Cart');
        }
      }
    });
  }

  onDotMouseleave(e) {
    const $el = $(e.currentTarget);
    $el.removeClass(classes.active);
  }

  onMouseenter() {
    if (this.$altLazyImg.length === 0) return;

    this.$altLazyImg.on('load', () => {
      this.$el.addClass(classes.altLoaded);
    });

    this.$altLazyImg.attr('src', this.$altLazyImg.data('src'));
    this.$altLazyImg.removeAttr('data-src');
  }

  destroy() {
    this.$el.off(this.events.MOUSEENTER);
  }
}
