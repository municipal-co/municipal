import $ from 'jquery';
import Swiper, { Pagination, Lazy, EffectFade } from 'swiper';
import BaseSection from './base';
import ProductDetail from '../view/product/productDetail';
import Drawer from '../ui/drawer';
import VideoPlayer from '../ui/videoPlayer';

const selectors = {
  productDetail: '[data-product-detail]',
  productForm: '[data-product-detail-form]',
  addToCartFormDrawer: '[data-add-to-cart-drawer]',
  fitGuideToggleButton: '[data-fit-guide-toggler]',
  videoPlayer: '[data-video-player]',
  featuresDrawer: '[data-features-drawer]',
  featuresDrawerToggler: '[data-features-toggler]',
  featuresDrawerSlider: '[data-features-slider]',
  sliderPagination: '[data-slider-pagination]',
  reviewsDrawerToggler: '[data-reviews-toggler]'
};

export default class ProductSection extends BaseSection {
  constructor(container) {
    super(container, 'product');

    this.productDetail = new ProductDetail(
      $(selectors.productDetail, this.$container)
    );
    this.$productForm = $(selectors.productForm);
    this.$productFormContainer = $(selectors.productFormContainer);
    this.$mobileProductFormContainer = $(selectors.mobileProductFormContainer);
    this.$featuresDrawerToggler = $(selectors.featuresDrawerToggler);
    this.$featuresDrawerSlider = $(selectors.featuresDrawerSlider);
    this.$reviewsToggler = $(selectors.reviewsDrawerToggler);

    this.$reviewsToggler.on('click', this.toggleReviewsModal.bind(this))

    $(document).on(
      'click',
      selectors.fitGuideToggleButton,
      this.toggleFitGuideModal.bind(this)
    );

    this.$featuresDrawerToggler.on(
      'click',
      this.toggleFeatureDrawer.bind(this)
    );

    new VideoPlayer(selectors.videoPlayer);

    if (document.querySelector('[data-fit-guide-settings]')) {

      if (document.location.hash === '#fitGuide') {
        this.toggleFitGuideModal();
        history.replaceState(
          null,
          '',
          document.location.href.replace('#fitGuide', '')
        );
      }
    }
  }

  toggleReviewsModal() {
    document.dispatchEvent(new CustomEvent('drawerOpen', {
      detail: {
        type:'reviews'
      }
    }))
  }

  toggleFitGuideModal() {
    const fitGuideSettings = JSON.parse(document.querySelector('[data-fit-guide-settings]').innerHTML)
    console.log(fitGuideSettings);
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('drawerOpen', {detail: {
        type: "sizing-drawer",
        ...fitGuideSettings
      }}))
    }, 500);
  }

  toggleFeatureDrawer(evt) {
    const drawerData = JSON.parse(evt.currentTarget.dataset.content);
    document.dispatchEvent(
      new CustomEvent('drawerOpen', {
        detail: {
          type: 'pdp-features',
          ...drawerData,
        },
      })
    );
  }
}
