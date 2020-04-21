import $ from 'jquery';
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
  addToCartFormDrawer: '[data-add-to-cart-drawer]'

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
    this.addToCartFormDrawer = new Drawer($(selectors.addToCartFormDrawer))

    this.observerProperties = {
      root: null,
      threshold: [0.1, 0.4]
    }

    $(selectors.desktopBuyNow, this.container).on('click', this.onBuyNowClick.bind(this));
    $(selectors.sectionScroller, this.container).on('click', this.sectionScrollerClick.bind(this));
    $('body').on('updateCurrentModule', this.onUpdateCurrentModule.bind(this));
    $(selectors.drawerToggler).on('click', this.toggleCollectionDrawer.bind(this));

    this.IntersectionObserver = new IntersectionObserver(this.observerCallback.bind(this), this.observerProperties);

    this.IntersectionObserver.observe($(selectors.productDetail).get(0));
  }

  observerCallback(entries, observer) {
    entries.forEach((entry) => {
      if (entry.intersectionRatio < 0.1) {
        this.$stickyBar.addClass(classes.visible);
        this.dettachAddToCartForm();
      }

      if (entry.intersectionRatio > 0.4) {
        $('body').css('background-color', '#ffffff');
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

    this.updateScrollerLinks(target);

    $('html, body').animate({
      scrollTop: targetOffset - stickyBarOffset
    }, 300);
  }

  onUpdateCurrentModule(event) {
    this.updateScrollerLinks(event.selector);
  }

  updateScrollerLinks(target) {
    const $scrollLinks = $(selectors.sectionScroller);

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
