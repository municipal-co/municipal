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
};

export default class ProductSection extends BaseSection {
  constructor(container) {
    super(container, 'product');

    this.productDetail = new ProductDetail($(selectors.productDetail, this.$container));
    this.$productForm = $(selectors.productForm);

    // drawers
    this.fitGuideDrawer = new Drawer($(selectors.fitGuideDrawer));
    this.galleries = [];

    $(selectors.fitGuideToggleButton).on('click', this.toggleFitGuideModal.bind(this));

    this.initFitGuideGalleries();
  }

  toggleFitGuideModal() {
    $('body').addClass('drawer-open');
    this.fitGuideDrawer.show();
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

        navigation: {
          nextEl: $('.swiper-button-next', $(el).parent()),
          prevEl: $('.swiper-button-prev', $(el).parent()),
        },
        pagination: {
          el: '.fit-guide__gallery-pagination',
          type: 'bullets',
        },
        lazy: {
          loadPrevNext: true,
        },
      }

      const swiperGallery = new Swiper($(el), galleryOptions);
      swiperGallery.on('slideChange', () => {
        this.$fitGuideGalleryIndexcontainer.text(swiperGallery.realIndex + 1);
      });
    });
  }
}
