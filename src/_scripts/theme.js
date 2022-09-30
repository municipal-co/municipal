// jQuery
import $ from 'jquery';
import 'chosen-js';
import 'jquery-unveil';
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

// UI - Import all to enable data API
import './ui/drawer';
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
import VideoSection from './sections/video';
import CustomersLoginSection from './sections/customersLogin';
import CustomersRegisterSection from './sections/customersRegister';
import CustomersAccountSection from './sections/customersAccount';
import CustomersAccountOrdersSection from './sections/customersAccountOrders';
import CustomersAddressesSection from './sections/customersAddresses';
import CustomersOrderSection from './sections/customersOrder';
import CustomersDrawerSection from './sections/customersDrawer';
import CustomersResetPasswordSection from './sections/customersResetPassword';
import YotpoReviews from './sections/yotpoReviews';
import FeaturedCategory from './sections/featuredCategories'
import ShopTheLook from './sections/shop-the-look';
import OptionDrawer from './sections/optionDrawer';
import LinkCardSlider from './sections/linkCardSlider';
import ContentSlider from './sections/contentSlider';
import BisDrawer from './sections/bisDrawer';
import Hero from './sections/hero';
import ProductCardSlider from './sections/productCardSlider';
import MktSubscriptionDrawer from './sections/mktSubscriptionDrawer';
import FourOFour from './sections/fourofour';


// Managers
// import QuickViewManager from './managers/quickView';

// Models
import ProductCard from './view/product/productCard';

// Templates
import './templates/pageStyles';
// import './templates/pageComponents';

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
  sectionManager.register('fourofour', FourOFour);
  sectionManager.register('product', ProductSection);
  sectionManager.register('cart', CartSection);
  sectionManager.register('ajax-cart', AJAXCartSection);
  sectionManager.register('pencil-banner', PencilBannerSection);
  sectionManager.register('collection', CollectionSection);
  sectionManager.register('blog', BlogSection);
  sectionManager.register('article', ArticleSection);
  sectionManager.register('video', VideoSection);
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
  sectionManager.register('yotpo-reviews', YotpoReviews);
  sectionManager.register('featured-categories', FeaturedCategory);
  sectionManager.register('shop-the-look', ShopTheLook);
  sectionManager.register('option-selector-drawer', OptionDrawer);
  sectionManager.register('link-card-slider', LinkCardSlider);
  sectionManager.register('content-slider', ContentSlider);
  sectionManager.register('bis-drawer', BisDrawer);
  sectionManager.register('hero', Hero);
  sectionManager.register('product-card-slider', ProductCardSlider);
  sectionManager.register('mkt-subscription-drawer', MktSubscriptionDrawer);

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

  window.getSiteSettingsJson = function() {
    return JSON.parse($('[data-theme-settings-json]').html());
  }
})(Modernizr);
