import $ from 'jquery';
import Swiper from 'swiper';
import BaseSection from './base';
import ProductDetail from '../view/product/productDetail';
import Drawer from '../ui/drawer';

const selectors = {
  productDetail: '[data-product-detail]',
  productForm: '[data-product-detail-form]',
  addToCartFormDrawer: '[data-add-to-cart-drawer]',
  fitGuideToggleButton: '[data-fit-guide-toggler]',
  fitGuideDrawer: '[data-fit-guide-drawer]',
  fitGuideGallery: '[data-fit-guide-gallery]',
  fitGuideGalleryIndex: '[data-fit-guide-gallery-current-index]',
  featuresDrawer: '[data-features-drawer]',
  featuresDrawerToggler: '[data-features-toggler]',
  featuresDrawerGallery: '[data-features-gallery]'
};

export default class ProductSection extends BaseSection {
  constructor(container) {
    super(container, 'product');

    this.productDetail = new ProductDetail($(selectors.productDetail, this.$container));
    this.$productForm = $(selectors.productForm);

    // drawers
    this.fitGuideDrawer = new Drawer($(selectors.fitGuideDrawer));
    this.featuresDrawer = new Drawer($(selectors.featuresDrawer));
    this.galleries = [];

    $(selectors.fitGuideToggleButton).on('click', this.toggleFitGuideModal.bind(this));

    this.initFitGuideGalleries();
    this.initFeaturesGalleries();
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
        loop: true,
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
}
