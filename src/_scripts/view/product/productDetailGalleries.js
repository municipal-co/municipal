import $ from 'jquery';
import { throttle } from 'throttle-debounce';
import Swiper from 'swiper';
import VimeoPlayer from '@vimeo/player';

const selectors = {
  productGallery: '[data-product-gallery]',
  productGallerySlideshow: '[data-product-gallery-slideshow]',
  productGalleryThumbnails: '[data-product-gallery-thumbnails]',
  productGalleryThumbnailsSlide: '[data-product-gallery-thumbnails-slide]',
  initialSlide: '[data-initial-slide]',
  currentThumbnail: '[data-current-thumbnail]',
  zoomInIcon: '[data-zoom-in-icon]',
  zoomOutIcon: '[data-zoom-out-icon]',
  zoomItem: '[data-zoom-item]',
  // Slider video
  videoContainer: '[data-video-player]',
  playVideo: '[data-play-gallery-video]'
};

const classes = {
  hide: 'hide',
  zoomReady: 'is-zoomable',
  zoomedIn: 'is-zoomed'
};

const $window = $(window);

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
    this.$zoomItem = $(selectors.zoomItem);
    this.playButton = this.$el.find($(selectors.playVideo));
    this.videoPlayers = [];

    // Look for element with the initialSlide selector. Commented due to removal of the feature, uncomment if needed.
    // const initialSlide = this.$slideshow.find(selectors.initialSlide).length ? this.$slideshow.find(selectors.initialSlide).index() : 0;

    this.thumbnailsSwiper = new Swiper(this.$thumbnails.get(0), {
      init: false,
      loop: false,
      watchOverflow: true,
      spaceBetween: 10,
      slidesPerView: 5,
      centerInsufficientSlides: true,
      centeredSlides: true,
      centeredSlidesBounds: true,
      preventClicks: true,
      preventClicksPropagation: true,
      speed: 500,
      preloadImages: false,
      direction: 'vertical',
      slideToClickedSlide: true,
      threshold: 25,
      // allowTouchMove: false,
      lazy: {
        loadPrevNext: true,
        loadPrevNextAmount: 1
      }
    });

    this.swiper = new Swiper(this.$slideshow.get(0), {
      init: false,
      loop: false,
      slidesPerView: 1,
      speed: 100,
      effect: 'fade',
      allowTouchMove: true,
      threshold: 0,
      preventClicks: true,
      preventClicksPropagation: true,
      fadeEffect: {
        crossFade: true
      },
      lazy: {
        loadPrevNext: true,
        loadPrevNextAmount: 1
      },
      scrollbar: {
        el: this.$slideshow.find('.swiper-scrollbar')
      },
      on: {
        init: this.onSlideShowInit.bind(this),
        slideChange: this.onSlidechange.bind(this)
      },
      breakpoints: {
        992: {
          // allowTouchMove: false,
          threshold: 75,
        }
      },
      thumbs: {
        swiper: this.thumbnailsSwiper
      }
    });

    this.thumbnailsSwiper.init();
    this.swiper.init();

    $window.on('resize', throttle('50', this.onResize.bind(this)));
    this.$slideshow.on('mousemove', this.locateZoomIcon.bind(this));
    this.$zoomItem.on('mousemove', this.locateZoomOutIcon.bind(this));

    if (this.playButton.length) {
      this.playButton.on('click', this.onPlaySlideVideo.bind(this));
    }
  }

  // Adjust gallery container to match the main gallery so the thumbnails space gets calculated properly.
  onResize() {
    const slideshowHeight = this.$slideshow.height();

    this.$thumbnails.height(slideshowHeight - 200);
  }

  locateZoomIcon(event) {
    if( $('.product__form--gift-card').length > 0 ) {
      return;
    }
    const $icon = $(selectors.zoomInIcon);
    const iconSize = $icon.width();
    const slideshowArea = {
      right: this.$slideshow.offset().left + this.$slideshow.width() - iconSize,
      bottom: this.$slideshow.offset().top + this.$slideshow.height() - iconSize
    }

    $icon.offset(
      {
        top: event.pageY < slideshowArea.bottom ? event.pageY : slideshowArea.bottom,
        left: event.pageX < slideshowArea.right ? event.pageX : slideshowArea.right
      }
    );
  }

  locateZoomOutIcon(event) {
    const $icon = $(selectors.zoomOutIcon);
    const iconSize = $icon.width();
    const zoomArea = {
      right: this.$zoomItem.offset().left + this.$zoomItem.width() - iconSize,
      bottom: this.$zoomItem.offset().top + this.$zoomItem.height() - iconSize
    }

    $icon.offset(
      {
        top: event.pageY < zoomArea.bottom ? event.pageY : zoomArea.bottom,
        left: event.pageX < zoomArea.right ? event.pageX : zoomArea.right
      }
    );
  }

  initHoverZoom($zoomTarget) {
    if( $('.product__form--gift-card').length > 0 ) {
      return;
    }
    this.destroyHoverZoom($zoomTarget);

    $zoomTarget.zoom({
      url: $zoomTarget.find('img').data('image-url'),
      on: 'click',
      target: '.zoom-container',
      touch: false,
      escToClose: true,
      magnify: 1,
      duration: 300,
      callback: () => {
        $zoomTarget.addClass(classes.zoomReady);
      },
      onZoomIn: () => {
        $zoomTarget.addClass(classes.zoomedIn);
        $('.zoom-container').addClass(classes.zoomedIn);
      },
      onZoomOut: () => {
        $('.zoom-container').removeClass(classes.zoomedIn);
        $zoomTarget.removeClass(classes.zoomedIn);
      }
    });
  }

  destroyHoverZoom($zoomTarget) {
    $zoomTarget.trigger('zoom.destroy');
  }

  // This is plays the gallery video when the user clicks on the play thumbnail
  onPlaySlideVideo() {
    const sw = this.swiper;
    const currentPlayer = this.getPlayerBySlide($(sw.slides[sw.activeIndex]));

    if(currentPlayer !== undefined) {
      currentPlayer.play();
      currentPlayer.playing = true;
    }
  }

  onSlideShowInit() {
    const sw = this.swiper;
    this.initHoverZoom($(sw.slides[sw.activeIndex]));
    const slideshowHeight = this.$slideshow.height();

    this.$thumbnails.height(slideshowHeight - 200);
    this.thumbnailsSwiper.update();

    this.initSlideVideo($(sw.slides[sw.activeIndex]));
  }

  initSlideVideo($slide) {
    const $videoContainer = $(selectors.videoContainer, $slide);
    this.$slideshow.removeClass('video-slideshow');
    this.pauseCurrentVideo();

    if($videoContainer.length){
      const playerObject = this.getPlayerBySlide($slide);
      this.$slideshow.addClass('video-slideshow');
      if(playerObject !== undefined) {
        playerObject.player.play();
        playerObject.playing = true;
      } else {
        const options = {
          url: $videoContainer.data('video-url'),
          background: true,
          autopause: true,
        }

        const player = new VimeoPlayer($videoContainer, options);

        this.videoPlayers.push ({
          slide: $slide,
          player: player,
          playing: true,
        });
      }
    }
  }

  getPlayerBySlide($slide) {
    let playerItem;
    $.each(this.videoPlayers, (i, playerObject) => {
      if (playerObject.slide.is($slide)) {
        playerItem = playerObject;
      }
    });

    return playerItem;
  }

  pauseCurrentVideo() {
    $.each(this.videoPlayers, (i, playerObject) => {
      if (playerObject.playing === true) {
        playerObject.player.pause().then(()=> {
          playerObject.playing = false;
        });
      }
    });
  }

  onSlidechange() {
    const sw = this.swiper;
    $(selectors.currentThumbnail, this.$el).text(sw.activeIndex + 1);
    this.destroyHoverZoom($(sw.slides[sw.previousIndex]));
    this.initHoverZoom($(sw.slides[sw.activeIndex]));
    this.initSlideVideo($(sw.slides[sw.activeIndex]));
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

    // This makes sure to pause all videos on all galleries when said gallery changes
    $.each(this.galleries, (i, gallery) => {

      if ($(selectors.videoContainer, gallery.$slideshow).length) {
        const sw = gallery.swiper;
        const currentPlayer = gallery.getPlayerBySlide($(sw.slides[sw.activeIndex]));

        if(currentPlayer !== undefined) {
          gallery.swiper.slideTo(0);
          gallery.pauseCurrentVideo();
        }
      }
    });

    if (this.galleries.length > 1) {
      for (let i = 3; i >= 1; i--) {
        const gallery = this.getProductDetailGalleryForVariantOptionValue(variant['option' + i]);

        if (gallery && gallery.$el.hasClass(classes.hide)) {

          this.$galleries.addClass(classes.hide);
          gallery.$el.removeClass(classes.hide);

          // Now that we show a different gallery, make sure it's all ready to go
          gallery.swiper.update();
          gallery.thumbnailsSwiper.update();
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
