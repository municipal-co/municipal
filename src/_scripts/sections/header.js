import $ from 'jquery';
import { throttle } from 'throttle-debounce';
import BaseSection from './base';

const $window = $(window);

const selectors = {
  header: '[data-header]',
  dropdownTrigger: '[data-dropdown-trigger][data-block]',
  toggle: '[data-search-drawer-toggle]',
  searchInput: '[data-search-input]',
  searchDrawer: '[data-search-drawer]',
  closeSearchDrawer: '[data-drawer-close]',
  headerFiller: '[data-header-filler]',
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

    this.$toggleSearchDrawer = $(selectors.toggle, this.$container);
    this.$closeSearchDrawer = $(selectors.closeSearchDrawer, this.$container);
    this.$searchInput = $(selectors.searchInput, this.$container);
    this.$searchDrawer  = $(selectors.searchDrawer, this.$container);

    this.initialPosition = 0;
    this.headerHeight = this.$el.height();
    this.headerOffset = this.$el.offset().top;


    $window.on(this.events.SCROLL, throttle(50, this.onScroll.bind(this)));

    this.$toggleSearchDrawer.on('click', this.onToggleSearchDrawer.bind(this));
    this.$closeSearchDrawer.on('click', this.onCloseSearchDrawer.bind(this));
    $window.on('toggleMobileMenu', this.onCloseSearchDrawer.bind(this));
    $window.on('resize', throttle(50, this.compensateHeaderSpace.bind(this)));

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

  onToggleSearchDrawer(e) {
    e.preventDefault();
    this.$searchDrawer.toggleClass('is-visible');
    this.$toggleSearchDrawer.toggleClass('search-is-open');
    this.$searchInput.trigger('focus');

    if(this.$searchDrawer.hasClass('is-visible')) {
      $window.trigger('toggleSearchDrawer');
    }
  }

  onCloseSearchDrawer(e) {
    e.preventDefault();
    this.$searchDrawer.removeClass('is-visible');
    this.$toggleSearchDrawer.removeClass('search-is-open');
  }

  compensateHeaderSpace() {
    $(selectors.headerFiller).height(this.$el.outerHeight());
  }
}
