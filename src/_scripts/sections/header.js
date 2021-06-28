import $ from 'jquery';
import { throttle } from 'throttle-debounce';
import BaseSection from './base';
import DropdownManager from '../managers/dropdown';

const $window = $(window);
const $body   = $(document.body);

const selectors = {
  header: '[data-header]',
  dropdownTrigger: '[data-dropdown-trigger][data-block]',
  toggle: '[data-search-drawer-toggle]',
  searchDrawer: '[data-search-drawer]',
  closeSearchDrawer: '[data-drawer-close]'
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
    this.$searchDrawer  = $(selectors.searchDrawer, this.$container);

    this.$container.on(this.events.MOUSELEAVE, this.onMouseLeave.bind(this));
    this.initialPosition = 0;

    // Register each dropdown trigger
    $(selectors.dropdownTrigger, this.$container).each((i, trigger) => {
      DropdownManager.register($(trigger));
    });

    // We pass in the fixed behavior as a class on the body of the site
    if ($body.hasClass(classes.siteHasFixedHeader)) {
      $window.on(this.events.SCROLL, throttle(50, this.onScroll.bind(this)));
      this.onScroll(); // hit this one time on init to make sure everything is good
    }

    this.$toggleSearchDrawer.on('click', this.onToggleSearchDrawer.bind(this));
    this.$closeSearchDrawer.on('click', this.onCloseSearchDrawer.bind(this));
  }

  scrollCheck() {
    // Do measurements outside of rAF.
    const scrollTop = $window.scrollTop();
    const actualOffset = this.$container.offset().top;

    // Do DOM updates inside.
    requestAnimationFrame(() => {
      if (scrollTop < actualOffset) {
        this.$el.removeClass(classes.headerFixed);
        this.$el.removeClass(classes.headerScroll);
        this.$el.removeClass(classes.showOnScroll);
        this.$el.removeClass(classes.hideOnScroll);
      }
      else if(scrollTop > actualOffset){
        this.$el.addClass(classes.headerFixed);
        this.$el.addClass(classes.headerScroll);
      }
    });
  }

  positionCheck() {
   const scrollTop = $window.scrollTop();
   const lastInitialPosition = this.initialPosition;

   // Do DOM updates inside.
    if (this.$el.hasClass(classes.headerScroll)) {
      requestAnimationFrame(() => {
        if (scrollTop > lastInitialPosition) {
          $body.removeClass('showing-header');
          this.$el.removeClass(classes.showOnScroll);
          this.$el.addClass(classes.hideOnScroll);
          this.initialPosition = scrollTop;
        }
        else if(scrollTop < lastInitialPosition){
          $body.addClass('showing-header');
          this.$el.addClass(classes.showOnScroll);
          this.$el.removeClass(classes.hideOnScroll);
          this.initialPosition = scrollTop;
          $window.trigger("showing-header");
        }
      });
    }
  }

  onScroll() {
    this.scrollCheck();

    if ($body.hasClass('header-hide-on-scroll')) {
      this.positionCheck();
    }
  }

  onMouseLeave() {
    DropdownManager.closeAllDropdowns();
  }

  onToggleSearchDrawer(e) {
    e.preventDefault();
    this.$searchDrawer.toggleClass('is-visible');
    this.$toggleSearchDrawer.toggleClass('search-is-open');
  }

  onCloseSearchDrawer(e) {
    e.preventDefault();
    this.$searchDrawer.removeClass('is-visible');
    this.$toggleSearchDrawer.removeClass('search-is-open');
  }

  onBlockSelect(e) {
    const dropdown = DropdownManager.getDropdownByBlockId(e.detail.blockId);

    // Bypass dropdown manager since we're inside the theme editor
    if (dropdown) {
      dropdown.forceOpen();
    }
  }

  onBlockDeselect(e) {
    const dropdown = DropdownManager.getDropdownByBlockId(e.detail.blockId);

    // Bypass dropdown manager since we're inside the theme editor
    if (dropdown) {
      dropdown.forceClose();
    }
  }
}
