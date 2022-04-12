// jQuery
import $ from 'jquery';
import 'jquery-zoom';
import 'chosen-js';
import 'jquery-unveil';
import 'objectFitPolyfill';
import 'lazysizes';


// Bootstrap JS
import 'bootstrap/js/dist/collapse';
import 'bootstrap/js/dist/modal';

// Core
import * as Utils from './core/utils';
import * as RTE from './core/rte';
import * as A11Y from './core/a11y';
import * as Animations from './core/animations';
import * as Breakpoints from './core/breakpoints';

// Managers
import BackgroundAnimationManager from './managers/backgroundAnimationManager';
import SectionBlockAnimation from './managers/sectionBlockAnimation';

// UI - Import all to enable data API
import './ui/drawer';
import './ui/overlay';
import './ui/slideup';
import './ui/tabs';
import './ui/quantityAdjuster';
import './ui/passwordValidation';

// Sections
import SectionManager from './sections/sectionManager';
import HeaderSection from './sections/header';
import FooterSection from './sections/footer';
import MobileMenuSection from './sections/mobileMenu';
import ProductSection from './sections/product';
import CartSection from './sections/cart';
import AJAXCartSection from './sections/ajaxCart';
import PencilBannerSection from './sections/pencilBanner';
import CollectionSection from './sections/collection';
import BlogSection from './sections/blog';
import ArticleSection from './sections/article';
import NewsletterModalSection from './sections/newsletterModal';
import NewsletterSlideupSection from './sections/newsletterSlideup';
import SlideshowSection from './sections/slideshow';
import SwatchesSection from './sections/swatches';
import VideoSection from './sections/video';
import CMSPageSection from './sections/cmsPage';
import CustomersLoginSection from './sections/customersLogin';
import CustomersRegisterSection from './sections/customersRegister';
import CustomersAccountSection from './sections/customersAccount';
import CustomersAccountOrdersSection from './sections/customersAccountOrders';
import CustomersAddressesSection from './sections/customersAddresses';
import CustomersOrderSection from './sections/customersOrder';
import CustomersDrawerSection from './sections/customersDrawer';
import CustomersResetPasswordSection from './sections/customersResetPassword';
import HeroSection from './sections/heroSection';
import ProductOverview from './sections/productOverview';
import ProductFeatures from './sections/productFeatures';
import ProductStyleTips from './sections/productStyleTips';
import CompleteTheLook from './sections/completeTheLook';
import CollectionBanner from './sections/collectionBanner';
import SearchResults from './sections/search';
import YotpoReviews from './sections/yotpoReviews';
import FouroFour from './sections/fourofour';
import BisDrawer from './sections/bisDrawer';
import ContentSlider from './sections/contentSlider';
import LinkCardSlider from './sections/linkCardSlider';

// Managers
import QuickViewManager from './managers/quickView';

// Models
import ProductCard from './view/product/productCard';

// Templates
import './templates/pageStyles';
import './templates/pageComponents';

// Do this ASAP
Animations.initialize();
Breakpoints.initialize();

((Modernizr) => {
  const $document = $(document);
  const $body = $(document.body);

  const sectionManager = new SectionManager();

  sectionManager.register('header', HeaderSection);
  sectionManager.register('footer', FooterSection);
  sectionManager.register('mobile-menu', MobileMenuSection);
  sectionManager.register('product', ProductSection);
  sectionManager.register('cart', CartSection);
  sectionManager.register('ajax-cart', AJAXCartSection);
  sectionManager.register('pencil-banner', PencilBannerSection);
  sectionManager.register('collection', CollectionSection);
  sectionManager.register('blog', BlogSection);
  sectionManager.register('article', ArticleSection);
  sectionManager.register('newsletter-modal', NewsletterModalSection);
  sectionManager.register('newsletter-slideup', NewsletterSlideupSection);
  sectionManager.register('slideshow', SlideshowSection);
  sectionManager.register('swatches', SwatchesSection);
  sectionManager.register('video', VideoSection);
  sectionManager.register('cms-page', CMSPageSection);
  sectionManager.register('customers-login', CustomersLoginSection);
  sectionManager.register('customers-register', CustomersRegisterSection);
  sectionManager.register('customers-account', CustomersAccountSection);
  sectionManager.register(
    'customers-account-orders',
    CustomersAccountOrdersSection
  );
  sectionManager.register('customers-addresses', CustomersAddressesSection);
  sectionManager.register('customers-order', CustomersOrderSection);
  sectionManager.register('customers-drawer', CustomersDrawerSection);
  sectionManager.register(
    'customers-reset-password',
    CustomersResetPasswordSection
  );
  sectionManager.register('hero', HeroSection);
  sectionManager.register('product-overview', ProductOverview);
  sectionManager.register('product-features', ProductFeatures);
  sectionManager.register('style-tips', ProductStyleTips);
  sectionManager.register('collection-banner', CollectionBanner);
  sectionManager.register('complete-the-look', CompleteTheLook);
  sectionManager.register('search', SearchResults);
  sectionManager.register('yotpo-reviews', YotpoReviews);
  sectionManager.register('fourofour', FouroFour);
<<<<<<< HEAD
  sectionManager.register('bis-drawer', BisDrawer);
  sectionManager.register('content-slider', ContentSlider);
=======
  sectionManager.register('link-card-slider', LinkCardSlider);
>>>>>>> feature/81448-cards-carousel

  $('.in-page-link').on('click', (evt) => {
    A11Y.pageLinkFocus($(evt.currentTarget.hash));
  });

  // Common a11y fixes
  A11Y.pageLinkFocus($(window.location.hash));

  // Target tables to make them scrollable
  RTE.wrapTables({
    $tables: $('.rte table'),
    tableWrapperClass: 'table-responsive'
  });

  // Target iframes to make them responsive
  const iframeSelectors =
    '.rte iframe[src*="youtube.com/embed"], .rte iframe[src*="player.vimeo"]';

  RTE.wrapIframe({
    $iframes: $(iframeSelectors),
    iframeWrapperClass: 'rte__video-wrapper'
  });

  // Apply UA classes to the document
  Utils.userAgentBodyClass();

  // Apply a specific class to the html element for browser support of cookies.
  if (Utils.cookiesEnabled()) {
    document.documentElement.className = document.documentElement.className.replace(
      'supports-no-cookies',
      'supports-cookies'
    );
  }

  // Initializes background color watcher.
  const $animatedBackgrounds = $('[data-animated-background]');
  new BackgroundAnimationManager($animatedBackgrounds);

  new SectionBlockAnimation();


  // // Initializes Images Animation Watcher
  // const $images = $('[data-animate-image-in]');
  // const imagesAnimationCallback = function(entries, observer) {
  //   const self = this;

  //   entries.forEach((entry) => {
  //     if (entry.intersectionRatio > 0.1) {
  //       const $image = $(entry.target);
  //       $image.addClass('in');
  //       self.intersectionObserver.unobserve(entry.target);
  //     }
  //   });
  // };
  // window.imagesAnimationManager = new IntersectionManager($images, imagesAnimationCallback);

  // // Initializes Titles Animation Watcher
  // const $textItems = $('h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4, .h5, .h6');
  // const textIntersectionSettings = {
  //   root: null,
  //   threshold: 0.1,
  //   rootMargin: '-10% 0% -20%'
  // }

  // $textItems.each((index, el) => {
  //   $(el).addClass('text-animate');
  // });

  // const textAnimationCallback = function(entries, observer) {
  //   const self = this;
  //   entries.forEach((entry) => {
  //     if (entry.intersectionRatio > 0.1) {
  //       const $title = $(entry.target);
  //       $title.addClass('in');
  //       self.intersectionObserver.unobserve(entry.target);
  //     }
  //   })
  // }
  // window.titlesAnimationManager = new IntersectionManager($textItems, textAnimationCallback, textIntersectionSettings);

  // Chosen JS plugin for select boxes
  Utils.chosenSelects();

  // Form event handling / validation
  $body.on('change keydown', '.form-control', (e) => {
    $(e.currentTarget).removeClass('is-invalid');
  });

  // START - Global handler for collapse plugin to add state class for open expandable lists
  const isOpenClass = 'is-open';

  $document.on('show.bs.collapse', '.collapse', (e) => {
    $(e.currentTarget)
      .parents('.expandable-list')
      .addClass(isOpenClass);
  });

  $document.on('hide.bs.collapse', '.collapse', (e) => {
    $(e.currentTarget)
      .parents('.expandable-list')
      .removeClass(isOpenClass);
  });

  $('.collapse.show').each(function() {
    $(this)
      .parents('.expandable-list')
      .addClass(isOpenClass);
  });
  // END - Global handler for collapse plugin to add state class for open expandable lists

  // Init any Product Cards on the page
  $('[data-product-card]').each((i, el) => {
    new ProductCard(el);
  });

  // Add lazyloading support for background images
  document.addEventListener('lazybeforeunveil', function(e) {
    const bg = e.target.getAttribute('data-background');
    if (bg) {
      e.target.style.backgroundImage = 'url(' + bg + ')';
    }
  });

  // Quickview stuff
  $body.on('click', '[data-quick-view-trigger]', function(e) {
    e.preventDefault();
    QuickViewManager.onQuickViewTriggerClick($(this));
  });

  window.getSiteSettingsJson = function() {
    return JSON.parse($('[data-theme-settings-json]').html());
  }
})(Modernizr);
