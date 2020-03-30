import $ from 'jquery';
import Swiper from 'swiper';

const selectors = {
  productGallery: '[data-product-gallery]',
  productGallerySlideshow: '[data-product-gallery-slideshow]',
  productGalleryThumbnails: '[data-product-gallery-thumbnails]',
  productGalleryThumbnailsSlide: '[data-product-gallery-thumbnails-slide]',
  initialSlide: '[data-initial-slide]'
};

const classes = {
  hide: 'hide',
  zoomReady: 'is-zoomable',
  zoomedIn: 'is-zoomed'
};

class ProductDetailGallery {
  /**
   * Product Detail Gallery Constructor
   * Handles the interaction between a single gallery and set of thumbnails
   * See: snippets/product-detail-galleries.liquid
   *
   * @param {HTMLElement | jQuery} el - gallery element containing elements matching the slideshow and thumbnails selectors
   */  
  constructor(el) {
    this.$el = $(el);
    this.$slideshow  = this.$el.find(selectors.productGallerySlideshow);
    this.$thumbnails = this.$el.find(selectors.productGalleryThumbnails);
    this.optionValue = this.$el.data('option-value');

    // Look for element with the initialSlide selector.
    const initialSlide = this.$slideshow.find(selectors.initialSlide).length ? this.$slideshow.find(selectors.initialSlide).index() : 0;

    this.swiper = new Swiper(this.$slideshow.get(0), {
      init: false,
      loop: true,
      initialSlide: initialSlide,
      speed: 500,
      navigation: {
        nextEl: this.$slideshow.find('.arrow--right').get(0),
        prevEl: this.$slideshow.find('.arrow--left').get(0)
      },
      pagination: {
        el: this.$slideshow.find('.swiper-pagination'),
        type: 'bullets',
        clickable: true
      },
      on: {
        init: this.onSlideShowInit.bind(this),
        slideChangeTransitionEnd: this.onSlideChangeTransitionEnd.bind(this)
      }
    });

    this.swiper.init();

    this.$thumbnails.on('click', selectors.productGalleryThumbnailsSlide, (e) => {
      this.swiper.slideToLoop($(e.currentTarget).index());
    });
  }

  initHoverZoom($zoomTarget) {
    this.destroyHoverZoom($zoomTarget);

    $zoomTarget.zoom({
      url: $zoomTarget.find('a').attr('href'),
      on: 'click',
      touch: false,
      escToClose: true,
      magnify: 1.2,
      duration: 300,
      callback: () => {
        $zoomTarget.addClass(classes.zoomReady);
      },
      onZoomIn: () => {
        $zoomTarget.addClass(classes.zoomedIn);
      },
      onZoomOut: () => {
        $zoomTarget.removeClass(classes.zoomedIn);
      }
    });
  }

  destroyHoverZoom($zoomTarget) {
    $zoomTarget.trigger('zoom.destroy');
  }

  onSlideShowInit() {
    const sw = this.swiper;
    this.initHoverZoom($(sw.slides[sw.activeIndex]));
  }

  onSlideChangeTransitionEnd() {
    const sw = this.swiper;
    this.destroyHoverZoom($(sw.slides[sw.previousIndex]));
    this.initHoverZoom($(sw.slides[sw.activeIndex]));
  }
}

export default class ProductDetailGalleries {
  /**
   * ProductDetailGalleries constructor
   * Initializes all galleries and updates visibility on variant change
   *
   * @param {Object} config   
   * @param {jQuery} config.$container - Main element, see snippets/product-detail-galleries.liquid
   */
  constructor(config) {
    this.settings = {};
    this.name = 'productDetailGalleries';
    this.namespace = `.${this.name}`;

    // Kind of pointless to have a defaults object like this
    // But doing it to keep consistent with productDetailForm
    const defaults = {
      $container: null
    };

    this.settings = $.extend({}, defaults, config);

    if (!this.settings.$container || this.settings.$container.length === 0) {
      console.warn(`[${this.name}] - config.$container required to initialize`);
      return;
    }

    this.$container = this.settings.$container; // Scoping element for all DOM lookups
    this.$galleries = $(selectors.productGallery, this.$container); // Galleries contain a slideshow + thumbnails

    this.galleries = this.$galleries.toArray().map(el => new ProductDetailGallery(el));
  }

  getProductDetailGalleryForVariantOptionValue(optionValue) {
    return this.galleries.filter(gallery => gallery.optionValue === optionValue)[0];
  }

  /**
   * Look for a gallery matching one of the selected variant's options and switch to that gallery
   * If a matching gallery doesn't exist, look for the variant's featured image in the main gallery and switch to that
   *
   * @param {Object} variant - Shopify variant object
   */
  updateForVariant(variant) {
    if (!variant) return;

    if (this.galleries.length > 1) {
      for (let i = 3; i >= 1; i--) {
        const gallery = this.getProductDetailGalleryForVariantOptionValue(variant['option' + i]);

        if (gallery && gallery.$el.hasClass(classes.hide)) {
          this.$galleries.addClass(classes.hide);
          gallery.$el.removeClass(classes.hide);

          // Now that we show a different gallery, make sure it's all ready to go
          gallery.swiper.update();
          gallery.onSlideShowInit();
        }
      }
    }
    else {
      // this.$galleries is just a single gallery
      // Slide to featured image for selected variant but only if we're not already on it.
      if (variant.featured_image && this.$galleries.find('.swiper-slide-active').data('image') !== variant.featured_image.id) { // eslint-disable-line
        const $imageSlide = this.$galleries.find(`[data-image="${variant.featured_image.id}"]`).first();

        if ($imageSlide.length) {
          this.galleries[0].swiper.slideToLoop($imageSlide.data('swiper-slide-index'));
        }
      }
    }
  }
}
