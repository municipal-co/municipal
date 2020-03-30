// jQuery
import $ from 'jquery';

// Core
import * as Image from './core/image';

((Modernizr) => {
  const $document = $(document);
  const $body = $(document.body);

  const STEP_PAGE_CLASS_REGEX = /(^|\s)step-\S+|page-\S+/g;

  const selectors = {
    productThumbnailImage: '.product-thumbnail__image'
  };

  const classes = {
    checkoutReady: 'checkout-ready'
  };

  // eslint-disable-next-line no-unused-vars
  const steps = {
    CONTACT: 'contact_information',
    SHIPPING: 'shipping_method',
    PAYMENT: 'payment_method',
    PROCESSING: 'processing',
    REVIEW: 'review'
  };

  // eslint-disable-next-line no-unused-vars
  const pages = {
    SHOW: 'show',
    STOCK_PROBLEMS: 'stock_problems',
    PROCESSING: 'processing',
    FORWARD: 'forward',
    THANK_YOU: 'thank_you'
  };

  // eslint-disable-next-line no-unused-vars
  function createSectionHeader(text) {
    return `<div class="section__header">
        <h2 class="section__title">${text}</h2>
      </div>`;
  }

  /**
   * Sets the body class based on the current step + page in checkout
   * Also removes any pre-existing classes in case of a page:check event instead of page reload
   *
   */
  function setBodyClasses() {
    const S = window.Shopify;

    if (S === undefined || S.Checkout === undefined) {
      return;
    }

    $body.removeClass((i, classname) => {
      return (classname.match(STEP_PAGE_CLASS_REGEX) || []).join(' ');
    });
    $body.addClass(`step-${S.Checkout.step.replace('_', '-')}`);
    $body.addClass(`page-${S.Checkout.page.replace('_', '-')}`);
  }

  $document.on('page:load page:change', () => {
    // Replace sidebar images with bigger versions
    $(selectors.productThumbnailImage).each((i, el) => {
      const $img = $(el);
      const $replaceImg = $(document.createElement('img'));
      const ogSrc = $img.attr('src');
      const size = Image.imageSize(ogSrc);

      // For some reason, simply updating the src attribute wasn't working so I'm resorting to creating another image and swapping it in
      if (size) {
        $replaceImg.attr('src', ogSrc.replace(size, 'large'));
        $replaceImg.attr('class', $img.attr('class'));
        $replaceImg.attr('alt', $img.attr('alt'));
        $img.replaceWith($replaceImg);
      }
    });

    setBodyClasses();
    $body.addClass(classes.checkoutReady);
  });
})(Modernizr);
