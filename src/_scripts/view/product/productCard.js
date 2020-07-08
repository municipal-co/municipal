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
  variantOptionList: '[data-variant-option-value-list]'
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
    try {
      this.productData = JSON.parse($(selectors.productJson, this.$el).html());
    } catch (error) {
      this.productData = null;
      console.error(error);
    }

    this.$variantMessage = $(selectors.variantMessage, this.$el);
    this.lowInventoryThreshold = $(selectors.variantOptionList).data('low-inventory-threshold');

    if (this.$el === undefined || !this.$el.is(selectors.el)) {
      console.warn(`[${this.name}] - Element matching ${selectors.el} required to initialize.`);
      return;
    }

    this.$mainLazyImg = $(selectors.mainLazyImg, this.$el);
    this.$altLazyImg  = $(selectors.altLazyImg, this.$el);
    this.timeout = false;

    // Unveil plugin to lazy load main product card images
    this.$mainLazyImg.unveil(200, function() {
      const $img = $(this);
      $img.on('load', () => {
        $img.parents(selectors.gallery).addClass(classes.mainLoaded);
        $img.addClass('in');
      });
    });

    if (this.$altLazyImg.length) {
      this.$el.one(this.events.MOUSEENTER, this.onMouseenter.bind(this));
    }

    $('body').on('updateVariant', this.onVariantUpdate.bind(this));
    this.$dot.on(this.events.MOUSEENTER, this.onDotMouseenter.bind(this));
    this.$dot.on(this.events.MOUSELEAVE, this.onDotMouseleave.bind(this));
    this.$dot.on(this.events.CLICK, this.onDotClick.bind(this));
    this.$variantMessage.on(this.events.CLICK, this.onTitleClick.bind(this));

    this.updateTitleVariant.call(this);
  }

  onTitleClick(e) {
    e.preventDefault();
    const $el = $(e.currentTarget);
    const currentVariant = $el.data('variant-id');
    if (currentVariant !== '') {
      CartAPI.addItemFromID(currentVariant)
      .then((data) => {
        const event = $.Event( this.events.UPDATE_AND_OPEN, { cart: data });
        $window.trigger(event);
      })
      .fail((data) => {
        alert(data.message);
      })
    }
  }

  updateTitleVariant(currentVariant = null) {
    if (currentVariant === null) {
      currentVariant = this.$dot.not('[disabled]').eq(0).data('variant-id');
    }

    this.$variantMessage.data('variant-id', currentVariant);
  }

  onVariantUpdate(e) {
    const currentOption = e.variantSelected;
    const colorIndex = this.productData.options.indexOf('Color') + 1;

    if (this.$el.is('[data-product-merged]')) {
      let imageUpdated = false;
      this.productData.variants.forEach((el) => {
        const lowcaseColor = el[`option${colorIndex}`].toLowerCase();
        const lowcaseVariant = currentOption.toLowerCase();
        if (lowcaseColor === lowcaseVariant && !imageUpdated) {
          const featuredImage = el.featured_image.src;
          const variantUrl = el.url;
          $(selectors.mainLazyImg, this.$el).attr('src', featuredImage);
          $('a', this.$el).attr('href', variantUrl);
          imageUpdated = true;
        }
      });

      if (!imageUpdated) {
        const defaultImage = this.productData.featured_image;
        const defaultUrl = this.productData.url;

        $(selectors.mainLazyImg, this.$el).attr('src', defaultImage);
        $('a', this.$el).attr('href', defaultUrl);
      }
    }
  }

  onDotClick(e) {
    e.preventDefault()
    const $el = $(e.currentTarget);
    const variantId = $el.data('variant-id');
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
    clearTimeout(this.timeout);

    $el.addClass(classes.active);

    $.each(this.productData.variants, function(index, variant) {
      if (variant.id === variantId) {
        const availability = variant.available;
        const inventoryQuantity = variant.inventory_quantity;
        self.updateTitleVariant(variantId);
        if (availability === false) {
          self.$variantMessage.text('Out of Stock');
          self.updateTitleVariant('');
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
    this.timeout = setTimeout(() => {
      this.resetBarTitle()
    }, 500);
  }

  onMouseenter() {
    if (this.$altLazyImg.length === 0) return;

    this.$altLazyImg.on('load', () => {
      this.$el.addClass(classes.altLoaded);
    });

    this.$altLazyImg.attr('src', this.$altLazyImg.data('src'));
    this.$altLazyImg.removeAttr('data-src');
  }

  resetBarTitle() {
    this.$variantMessage.text('Quick Add to Cart');
  }

  destroy() {
    this.$el.off(this.events.MOUSEENTER);
  }
}
