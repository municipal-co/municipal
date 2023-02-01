import $ from 'jquery';
import { throttle } from 'throttle-debounce';
import BaseSection from './base';

const $window = $(window);

const selectors = {
  header: '[data-header]',
  dropdownTrigger: '[data-dropdown-trigger][data-block]',
  searchButton: '[data-search-open-button]',
  searchInput: '[data-search-input]',
  searchDrawer: '[data-search-drawer]',
  closeSearchDrawer: '[data-drawer-close]',
  headerFiller: '[data-header-filler]',
  menuToggler: '[data-mobile-menu-toggle]',
};

const classes = {
  headerFixed: 'is-fixed',
  siteHasFixedHeader: 'site-fixed-header',
  headerScroll: 'is-scrolling',
  showOnScroll: 'show-on-scroll',
  hideOnScroll: 'hide-on-scroll'
};

export default class HeaderSection extends BaseSection {
  constructor(container) {
    super(container, 'header');

    this.$el = $(selectors.header, this.$container);

    this.$searchButton = $(selectors.searchButton, this.$container);
    this.$menuToggler= $(selectors.menuToggler, this.$container);

    this.initialPosition = 0;
    this.headerHeight = this.$el.height();
    this.headerOffset = this.$el.offset().top;


    $window.on(this.events.SCROLL, throttle(50, this.onScroll.bind(this)));

    this.$searchButton.on('click', this.openSearchDrawer.bind(this));
    $window.on('resize', throttle(50, this.compensateHeaderSpace.bind(this)));
    this.$menuToggler.on('click', this.toggleMenu.bind(this));
    this.onScroll();
    this.compensateHeaderSpace();
  }

  onScroll() {
    const currentScroll =  $window.scrollTop();

    this.setScrollDirection(currentScroll);

    if(currentScroll >= this.headerOffset) {
      this.$el.addClass(classes.headerFixed);
    } else {
      this.$el.removeClass(classes.headerFixed);
    }

    if(currentScroll > (this.headerHeight + this.headerOffset)) {
      this.updateHeaderVisibility();
    } else {
      this.scrollDirection = 'up';
      this.updateHeaderVisibility();
    }
  }

  setScrollDirection(currentScroll) {
    if(currentScroll < this.initialPosition - 10) {
      this.scrollDirection = 'up';
      this.initialPosition = currentScroll;
    } else if(currentScroll > this.initialPosition + 10) {
      this.scrollDirection = 'down';
      this.initialPosition = currentScroll;
    }
  }

  updateHeaderVisibility() {
    if(!this.$el.hasClass(classes.showOnScroll) && this.scrollDirection === 'up') {
      this.$el.addClass(classes.showOnScroll);
      this.$el.removeClass(classes.hideOnScroll);
    }

    if(!this.$el.hasClass(classes.hideOnScroll) && this.scrollDirection === 'down') {
      this.$el.addClass(classes.hideOnScroll);
      this.$el.removeClass(classes.showOnScroll);
    }
  }

  openSearchDrawer(e) {
    document.dispatchEvent(new CustomEvent('drawer:search-open'));
    document.dispatchEvent(new CustomEvent('drawer:open-header-drawer', {detail: {target: 'search'}}));
  }

  toggleMenu(e) {
    e.preventDefault();
    document.dispatchEvent(new CustomEvent('navigation:toggle'));
  }

  compensateHeaderSpace() {
    $(selectors.headerFiller).height(this.$el.outerHeight());
  }
}
