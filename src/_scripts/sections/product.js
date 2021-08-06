import $ from 'jquery';
import Swiper from 'swiper';
import BaseSection from './base';
import ProductDetail from '../view/product/productDetail';
import Drawer from '../ui/drawer';
import * as Breakpoints from '../core/breakpoints';

const selectors = {
  productDetail: '[data-product-detail]',
  productStickyBar: '[data-product-sticky-bar]',
  sectionScroller: '[data-scroll-to-section]',
  desktopBuyNow: '[data-desktop-buy-now]',
  collectionDrawer: '[data-collection-drawer]',
  drawerToggler: '[data-toggle-collection-grid]',
  productForm: '[data-product-detail-form]',
  productFormContainer: '[data-product-form-container]',
  mobileProductFormContainer: '[data-mobile-product-form-container]',
  addToCartFormDrawer: '[data-add-to-cart-drawer]',
  fitGuideToggleButton: '[data-fit-guide-toggler]',
  fitGuideModal: '[data-fit-guide-modal]',
  fitGuideGallery: '[data-fit-guide-gallery]',
  fitGuideTabsDots: '[data-fit-guide-toggle-tab]',
  fitGuideTabContent: '[data-fit-guide-tab]',
};

const classes = {
  visible: 'is-visible',
  active: 'is-active'
}

export default class ProductSection extends BaseSection {
  constructor(container) {
    super(container, 'product');

    this.productDetail = new ProductDetail($(selectors.productDetail, this.$container));
    this.$stickyBar = $(selectors.productStickyBar, this.$container);
    this.$productForm = $(selectors.productForm);
    this.$productFormContainer = $(selectors.productFormContainer);
    this.$mobileProductFormContainer = $(selectors.mobileProductFormContainer);

    // drawers
    this.productsDrawer = new Drawer($(selectors.collectionDrawer));
    this.addToCartFormDrawer = new Drawer($(selectors.addToCartFormDrawer));
    this.galleries = [];

    this.observerProperties = {
      root: null,
      threshold: [0.1, 0.4]
    }

    $(selectors.desktopBuyNow, this.container).on('click', this.onBuyNowClick.bind(this));
    $(selectors.sectionScroller, this.container).on('click', this.sectionScrollerClick.bind(this));
    $('body').on('moduleInView', this.onModuleInView.bind(this));
    $(selectors.drawerToggler).on('click', this.toggleCollectionDrawer.bind(this));
    $(selectors.fitGuideToggleButton).on('click', this.toggleFitGuideModal.bind(this));
    $(selectors.fitGuideTabsDots).on('click', this.toggleFitGuideTab.bind(this));
    $('body').on('updateVariant', this.onToggleVariant.bind(this));

    this.initFitGuideGalleries();

    this.IntersectionObserver = new IntersectionObserver(this.observerCallback.bind(this), this.observerProperties);
    this.IntersectionObserver.observe($(selectors.productDetail).get(0));
  }

  toggleFitGuideModal() {
    $(selectors.fitGuideModal).modal('show');
  }

  initFitGuideGalleries() {
    $(selectors.fitGuideGallery).each((index, el) => {

      const galleryOptions = {
        watchOverflow: true,
        preloadImages: false,
        arrows: true,
        observer: true,
        observeParents: true,

        navigation: {
          nextEl: $('.swiper-button-next', $(el).parent()),
          prevEl: $('.swiper-button-prev', $(el).parent()),
        },
        scrollbar: {
          el: $('.swiper-scrollbar', $(el).parent()),
          dragabble: true,
        },
        lazy: true
      }

      const swiperGallery = new Swiper($(el), galleryOptions);

      this.galleries.push(swiperGallery);
    });
  }

  toggleFitGuideTab(e) {
    const $this = $(e.currentTarget);
    const $container = $this.parent();

    if (!$this.hasClass(classes.active)) {
      const tabTarget = $this.data('fit-guide-toggle-tab');
      $(selectors.fitGuideTabsDots, $container).removeClass(classes.active);
      $this.addClass(classes.active);
      $(`${selectors.fitGuideTabContent}`).hide();
      $(`[data-fit-guide-tab="${tabTarget}"]`).show();
    }
  }

  onToggleVariant(e) {
    const variant = e.variantSelected;

    const $optionToEnable = $(`[data-fit-guide-toggle-tab="${variant}"]`);

    if ($optionToEnable.length > 0 && !$optionToEnable.hasClass(classes.active)) {
      $(selectors.fitGuideTabsDots, $optionToEnable.parent()).removeClass(classes.active);
      $optionToEnable.addClass(classes.active);

      $(`${selectors.fitGuideTabContent}`).hide();
      $(`[data-fit-guide-tab="${variant}"]`).show();
    }

    //
  }

  observerCallback(entries, observer) {
    entries.forEach((entry) => {
      if (entry.intersectionRatio < 0.1) {
        this.$stickyBar.addClass(classes.visible);
        this.dettachAddToCartForm();
      }

      if (entry.intersectionRatio > 0.4) {
        this.$stickyBar.removeClass(classes.visible);
        this.attachAddToCartForm();
      }
    })
  }

  dettachAddToCartForm() {
    const formHeight = this.$productForm.height();

    this.$productFormContainer.css('min-height', formHeight);
    this.$productForm.detach().appendTo(this.$mobileProductFormContainer);
  }

  attachAddToCartForm() {
    this.$productFormContainer.css('min-height', null);
    this.$productForm.detach().appendTo(this.$productFormContainer);
  }

  onBuyNowClick(event) {
    event.preventDefault();
    const screenWidth = $(window).width();
    const breakpointMinWidth = Breakpoints.getBreakpointMinWidth('md');
    if (screenWidth <= breakpointMinWidth) {
      this.addToCartFormDrawer.show();
      $('body').addClass('drawer-open');
    } else {
      $('html, body').animate({
        scrollTop: 0
      }, 300);
    }
  }

  sectionScrollerClick(event) {
    event.preventDefault();
    const target = $(event.currentTarget).attr('href');
    const targetOffset = $(target).offset().top;
    const stickyBarOffset = this.$stickyBar.outerHeight();

    $('html, body').animate({
      scrollTop: targetOffset - stickyBarOffset
    }, 300);
  }

  onModuleInView(event) {
    this.updateScrollerLinks(event.selector);
  }

  updateScrollerLinks(target) {
    $(selectors.sectionScroller).each((index, el) => {
      if ($(el).attr('href') === target) {
        $(el).addClass(classes.active).siblings().removeClass(classes.active);
      }
    })
  }

  toggleCollectionDrawer(event) {
    event.preventDefault();
    $('body').toggleClass('drawer-open');
    this.productsDrawer.toggle();
  }
}
