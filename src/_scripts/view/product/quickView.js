import $ from 'jquery';
import imagesLoaded from 'imagesloaded';
import * as Utils from '../../core/utils';
import ProductDetail from './productDetail';

const selectors = {
  quickView: '[data-quick-view]',
  quickViewContentsBody: '[data-quick-view-contents-body]',
  quickViewClose: '[data-quick-view-close]',
  productCardContents: '[data-product-card-contents]',
  productDetail: '[data-product-detail]'
};

const classes = {
  quickViewIsOpen: 'is-open',
  productCardHasOpenQuickView: 'has-open-quick-view'
};

/**
 * QuickView
 * -------------------------------------------------------------------------------
 * QuickView is a version of the product detail form
 * that we pull down via AJAX and append to a product card.
 *
 * @namespace quickView
 */

export default class QuickView {
  /**
   * QuickView constructor
   *
   * @param { Object } settings
   * @param { HTMLElement | jQuery } settings.$productCard
   * @param { String } settings.url - URL pointing to the quick view of the product
   * @param { Function } settings.onProductDetailReady - Called after the product form is initialized.  `this` references the QuickView instance
   * @param { Number } settings.transitionDuration - ms
   * @param { String } settings.transitionTimingFunction - string matching a jQuery easing equation.  see core/animations
   */  
  constructor(options) {
    this.name = 'quickView';
    this.namespace = `.${this.name}`;

    const defaults = {
      onProductDetailReady: $.noop,
      transitionDuration: 800,
      transitionTimingFunction: 'ease-in-out'
    };

    this.settings = $.extend({}, defaults, options);

    if (this.settings.$productCard === undefined) {
      console.warn('['+this.name+'] - $productCard element required to initialize');
      return;
    }

    if (typeof this.settings.url !== 'string' || this.settings.url.length === 0 || this.settings.url.indexOf('quick-view') === -1) {
      console.warn(`[${this.name}] - valid URL required to initialize`);
      return;
    }

    // Elements we'll need for everything to work
    this.$productCard           = this.settings.$productCard;
    this.$productCardContents   = this.$productCard.find(selectors.productCardContents);
    this.$productDetail         = null;
    this.$quickView             = null;
    this.$quickViewContentsBody = null;
    this.$close                 = null;

    this.stateIsOpen            = false;
    this.supportsCssTransitions = !!Modernizr.csstransitions;
    this.productDetailInstance  = null;

    this.events = {
      OPEN:   'open'   + this.namespace,
      OPENED: 'opened' + this.namespace,
      CLOSE:  'close'  + this.namespace,
      CLOSED: 'closed' + this.namespace,
      LOADED: 'loaded' + this.namespace
    };

    this.$productCard.on('click', selectors.quickViewClose, this.onCloseClick.bind(this));

    this.$productCard.height(this.$productCardContents.outerHeight(true));

    // Initial ajax request to get the quick view content
    $.get(this.settings.url, this._onAjaxSuccess.bind(this));
  }

  /**
   * Initial AJAX Call callback
   * Gets the returned HTML, adds it to the DOM, sets the instance's dom element variables, initializes the product detail form
   *
   */
  _onAjaxSuccess(ajaxResponse) {
    this.$productCard.append($(ajaxResponse));

    this.$productDetail         = this.$productCard.find(selectors.productDetail);
    this.$quickView             = this.$productCard.find(selectors.quickView);
    this.$quickViewContentsBody = this.$productCard.find(selectors.quickViewContentsBody);
    this.$close                 = this.$quickView.find(selectors.quickViewClose);

    this.productDetailInstance = new ProductDetail(this.$productDetail, false);

    this.settings.onProductDetailReady.call(this);

    // Fire off the loaded event once all the images in the quick view are loaded
    imagesLoaded(this.$quickView.get(0), () => {
      const e = $.Event(this.events.LOADED);
      this.$productCard.trigger(e);
    });
  }

  open() {
    this.onOpen();

    if (this.isOpen()) {
      return;
    }

    this.stateIsOpen = true;
    this.doOpenAnimation();
  }

  close() {
    this.onClose();

    if (this.isClosed()) {
      return;
    }

    this.stateIsOpen = false;
    this.doCloseAnimation();
  }

  isOpen() {
    return this.stateIsOpen;
  }

  isClosed() {
    return !this.isOpen();
  }

  /**
   * Called after this.open is called but before any opening animation has run
   */
  onOpen() {
    this.$productCard.addClass(classes.productCardHasOpenQuickView);
    const e = $.Event(this.events.OPEN);
    this.$productCard.trigger(e);
  }

  /**
   * Called after this.close is called but before any closing animation has run
   */
  onClose() {
    this.$productCard.removeClass(classes.productCardHasOpenQuickView);
    const e = $.Event(this.events.CLOSE);
    this.$productCard.trigger(e);
  }

  /**
   * Called after the opening animation has run
   */
  onOpened() {
    const e = $.Event(this.events.OPENED);
    this.$productCard.trigger(e);
  }

  /**
   * Called after the closing animation has run
   */
  onClosed() {
    const e = $.Event(this.events.CLOSED);
    this.$productCard.trigger(e);
    this.$quickView.removeClass(classes.quickViewIsOpen);
  }

  doOpenAnimation() {
    this.$quickView.addClass(classes.quickViewIsOpen);

    const productCardContentsHeight = this.$productCardContents.outerHeight(true);
    const qvHeight = this.$quickViewContentsBody.outerHeight(true);
    
    this.$productCard.height(productCardContentsHeight);
    this.$quickView.height(0);

    this.setTransitions();
    
    this.$productCard.height(productCardContentsHeight + qvHeight);
    this.$quickView.height(qvHeight);

    if (this.supportsCssTransitions) {
      this.$quickView.one(Utils.whichTransitionEnd(), this.onOpened.bind(this));
    }
    else {
      this.onOpened();
    }
  }

  doCloseAnimation() {
    this.stateIsOpen = false;
    
    const productCardContentsHeight = this.$productCardContents.outerHeight(true);

    this.$productCard.height(productCardContentsHeight);
    this.$quickView.height(0);

    if (this.supportsCssTransitions) {
      this.$quickView.one(Utils.whichTransitionEnd(), this.onClosed.bind(this));
    }
    else {
      this.onClosed();
    }
  }

  onResize() {
    const qvHeight = this.$quickViewContentsBody.outerHeight(true);
    const pccHeight = this.$productCardContents.outerHeight(true);

    if (this.isClosed()) {
      this.$productCard.height(pccHeight);
    }
    else {
      this.$productCard.height(pccHeight + qvHeight);
      this.$quickView.height(qvHeight);
    }
  }

  setTransitions() {
    const trans = `height ${this.settings.transitionDuration}ms ${this.settings.transitionTimingFunction}`;
    this.$quickView.css('transition', trans);
    this.$productCard.css('transition', trans);
  }

  scrollToProductCard() {
    $('html, body').animate({ scrollTop: (this.$productCard.offset().top - 100) });
  }

  scrollToQuickView() {
    $('html, body').animate({ scrollTop: this.$quickView.offset().top });
  }

  onCloseClick(e) {
    e.preventDefault();
    this.close();
  }
}
