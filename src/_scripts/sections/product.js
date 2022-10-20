import $ from 'jquery';
import Swiper from 'swiper';
import BaseSection from './base';
import ProductDetail from '../view/product/productDetail';
import Drawer from '../ui/drawer';
import VideoPlayer from '../ui/videoPlayer';

const selectors = {
  productDetail: '[data-product-detail]',
  productForm: '[data-product-detail-form]',
  addToCartFormDrawer: '[data-add-to-cart-drawer]',
  fitGuideToggleButton: '[data-fit-guide-toggler]',
  fitGuideDrawer: '[data-fit-guide-drawer]',
  fitGuideGallery: '[data-fit-guide-gallery]',
  fitGuideGalleryIndex: '[data-fit-guide-gallery-current-index]',
  videoPlayer: '[data-video-player]',
  featuresDrawer: '[data-features-drawer]',
  featuresDrawerToggler: '[data-features-toggler]',
  featuresDrawerSlider: '[data-features-slider]',
  sliderPagination: '[data-slider-pagination]',
};

export default class ProductSection extends BaseSection {
  constructor(container) {
    super(container, 'product');

    this.productDetail = new ProductDetail($(selectors.productDetail, this.$container));
    this.$productForm = $(selectors.productForm);
    this.$featuresDrawerToggler = $(selectors.featuresDrawerToggler);
    this.$featuresDrawerSlider = $(selectors.featuresDrawerSlider);

    // drawers
    this.galleries = [];

    $(document).on('click', selectors.fitGuideToggleButton, this.toggleFitGuideModal.bind(this));
    this.$featuresDrawerToggler.on('click', this.toggleFeatureDrawer.bind(this));


    new VideoPlayer(selectors.videoPlayer);

    if($(selectors.fitGuideDrawer).length) {
      this.fitGuideDrawer = new Drawer($(selectors.fitGuideDrawer));
      this.initFitGuideGalleries();
      if(document.location.hash === '#fitGuide') {
        this.fitGuideDrawer.show();
        history.replaceState(null, '', document.location.href.replace('#fitGuide', ''));
      }
    }

    if(this.$featuresDrawerToggler.length) {
      this.featuresDrawer = new Drawer($(selectors.featuresDrawer));
      this.initFeaturesSlider();
    }
  }

  toggleFitGuideModal() {
    $('body').addClass('drawer-open');
    this.fitGuideDrawer.show();
  }

  toggleFeatureDrawer() {
    this.featuresDrawer.toggle();
  }

  initFitGuideGalleries() {
    $(selectors.fitGuideGallery).each((index, el) => {

      const galleryOptions = {
        watchOverflow: true,
        preloadImages: false,
        arrows: false,
        observer: true,
        observeParents: true,
        loop: false,
        pagination: {
          el: '.fit-guide__gallery-pagination',
          type: 'bullets',
          clickable: true,
        },
        lazy: {
          loadPrevNext: true,
        },
      }

      const swiperGallery = new Swiper($(el), galleryOptions);
    });
  }

  initFeaturesSlider() {
    if(this.$featuresDrawerSlider.length) {
      const featuresSlider = new Swiper(this.$featuresDrawerSlider, {
        watchOverflow: true,
        preloadImages: false,
        arrows: false,
        observer: true,
        observeParents: true,
        loop: true,
        effect: 'fade',
        fadeEffect: {
          crossFade: true,
        },
        pagination: {
          el: '.features-detail__slider-pagination',
          type: 'bullets',
          clickable: true,
        },
        lazy: {
          loadPrevNext: true,
        },
        init: false
      });

      featuresSlider.on('slideChange', function() {
        const sliderWidth = featuresSlider.width;
        $(selectors.sliderPagination, this.$featuresDrawerSlider).css('top', sliderWidth + 20);
      })

      featuresSlider.init();
    }

  }
}
