// jQuery
import $ from 'jquery';
import 'chosen-js';
import 'jquery-unveil';
import 'lazysizes';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { client } from './lib/findifyApi';

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
import ProductSection from './sections/product';
import CartSection from './sections/cart';
import AJAXCartSection from './sections/ajaxCart';
import PencilBannerSection from './sections/pencilBanner';
import BlogSection from './sections/blog';
import ArticleSection from './sections/article';
import VideoSection from './sections/video';
import CustomersLoginSection from './sections/customersLogin';
import CustomersRegisterSection from './sections/customersRegister';
import CustomersAccountSection from './sections/customersAccount';
import CustomersAccountOrdersSection from './sections/customersAccountOrders';
import CustomersAddressesSection from './sections/customersAddresses';
import CustomersOrderSection from './sections/customersOrder';
import CustomersResetPasswordSection from './sections/customersResetPassword';
import ShopTheLookEditor from './sections/shop-the-look-editor';
import OptionDrawer from './sections/optionDrawer';
import FeaturedCategory from './sections/featuredCategories'
import ShopTheLook from './sections/shop-the-look';
import LinkCardSlider from './sections/linkCardSlider';
import ContentSlider from './sections/contentSlider';
import Hero from './sections/hero';
import ContentMedia from './sections/contentMedia';
import Parallax from './sections/parallax';
import ProductCardSlider from './sections/productCardSlider';
import FourOFour from './sections/fourofour';
import Faq from './sections/faq';

// Models
import ProductCard from './view/product/productCard';

// Templates
import './templates/pageStyles';

// Views
import MainNav from './view/navigation/navigation';
import Collection from './templates/collection';
import Search from './templates/search';
import AutocompleteSearch from './view/navigation/autocompleteSearch';
import DrawerSystem from './view/drawer/DrawerSystem';
import ProductYmal from './view/product/productYmal.js';

// Do this ASAP
Animations.initialize();
Breakpoints.initialize();

((Modernizr) => {
  const $document = $(document);
  const $body = $(document.body);

  const sectionManager = new SectionManager();

  sectionManager.register('header', HeaderSection);
  sectionManager.register('footer', FooterSection);
  sectionManager.register('fourofour', FourOFour);
  sectionManager.register('product', ProductSection);
  sectionManager.register('cart', CartSection);
  sectionManager.register('ajax-cart', AJAXCartSection);
  sectionManager.register('pencil-banner', PencilBannerSection);
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
  sectionManager.register(
    'customers-reset-password',
    CustomersResetPasswordSection
  );
  sectionManager.register('shop-the-look-editor', ShopTheLookEditor);
  sectionManager.register('option-selector-drawer', OptionDrawer);
  sectionManager.register('featured-categories', FeaturedCategory);
  sectionManager.register('shop-the-look', ShopTheLook);
  sectionManager.register('link-card-slider', LinkCardSlider);
  sectionManager.register('content-slider', ContentSlider);
  sectionManager.register('hero', Hero);
  sectionManager.register('content-media', ContentMedia);
  sectionManager.register('parallax', Parallax);
  sectionManager.register('product-card-slider', ProductCardSlider);
  sectionManager.register('faq', Faq);

  // Register Mobile navigation
  const navigationHolder = document.getElementById('main_navigation');
  const navigationRoot = ReactDOM.createRoot(navigationHolder);
  navigationRoot.render(<MainNav />);

  const collectionHolder = document.getElementById('collection');
  if (collectionHolder) {
    const collectionRoot = ReactDOM.createRoot(collectionHolder);
    collectionRoot.render(<Collection />);
  }

  const searchHolder = document.getElementById('search-container');
  if (searchHolder) {
    const searchRoot = ReactDOM.createRoot(searchHolder);
    searchRoot.render(<Search />);
  }

  const autocompleteHolder = document.getElementById('autocomplete-wrapper');
  if (autocompleteHolder) {
    const autocompleteRoot = ReactDOM.createRoot(autocompleteHolder);
    autocompleteRoot.render(<AutocompleteSearch />);
  }

  const drawerHolder = document.getElementById('drawer-container');
  if (drawerHolder) {
    const drawersRoot = ReactDOM.createRoot(drawerHolder);
    drawersRoot.render(<DrawerSystem />, drawerHolder);
  }

  const ymalHolder = document.getElementById('pdp-you-may-also-like');

  if (ymalHolder) {
    const ymalRoot = ReactDOM.createRoot(ymalHolder);
    ymalRoot.render(<ProductYmal />, ymalHolder);
  }

  $('.in-page-link').on('click', (evt) => {
    A11Y.pageLinkFocus($(evt.currentTarget.hash));
  });

  // Common a11y fixes
  A11Y.pageLinkFocus($(window.location.hash));

  // Target tables to make them scrollable
  RTE.wrapTables({
    $tables: $('.rte table'),
    tableWrapperClass: 'table-responsive',
  });

  // Target iframes to make them responsive
  const iframeSelectors =
    '.rte iframe[src*="youtube.com/embed"], .rte iframe[src*="player.vimeo"]';

  RTE.wrapIframe({
    $iframes: $(iframeSelectors),
    iframeWrapperClass: 'rte__video-wrapper',
  });

  // Apply UA classes to the document
  Utils.userAgentBodyClass();

  // Apply a specific class to the html element for browser support of cookies.
  if (Utils.cookiesEnabled()) {
    document.documentElement.className =
      document.documentElement.className.replace(
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
    $(e.currentTarget).parents('.expandable-list').addClass(isOpenClass);
  });

  $document.on('hide.bs.collapse', '.collapse', (e) => {
    $(e.currentTarget).parents('.expandable-list').removeClass(isOpenClass);
  });

  $('.collapse.show').each(function () {
    $(this).parents('.expandable-list').addClass(isOpenClass);
  });
  // END - Global handler for collapse plugin to add state class for open expandable lists

  // Init any Product Cards on the page
  $('[data-product-card]').each((i, el) => {
    new ProductCard(el);
  });

  // Add lazyloading support for background images
  document.addEventListener('lazybeforeunveil', function (e) {
    const bg = e.target.getAttribute('data-background');
    if (bg) {
      e.target.style.backgroundImage = 'url(' + bg + ')';
    }
  });

  const viewPageData = {
    ref: document.referrer,
    url: document.location.href,
    height: window.screen.height,
    width: window.screen.width,
  };

  let productData = document.querySelector('[data-product-json]');
  const isProduct = $body.hasClass('template-product');

  if (isProduct && productData) {
    productData = JSON.parse(productData.innerHTML);
    let variant = new URLSearchParams(document.location.search).get('variant');

    if (!variant) {
      variant = productData.variants[0].id.toString();
    }

    viewPageData['item_id'] = productData.id.toString();
    viewPageData['variant_item_id'] = variant.toString();
  }

  client.sendEvent('view-page', viewPageData);

  window.getSiteSettingsJson = function () {
    return JSON.parse($('[data-theme-settings-json]').html());
  };

  const lookTriggers = document.querySelectorAll('[data-shop-the-look-trigger]');

  lookTriggers.forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      if(e.currentTarget.hasAttribute('data-shop-the-look-trigger')) {
        const event = new CustomEvent('drawerOpen', {detail: {
          type: 'shop-the-look',
          productsData: JSON.parse(e.currentTarget.dataset.shopTheLookProducts),
        }})

        document.dispatchEvent(event);
      }
    })
  })
})(Modernizr);
