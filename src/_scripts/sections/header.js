import $ from 'jquery';
import { throttle } from 'throttle-debounce';
import BaseSection from './base';
import DropdownManager from '../managers/dropdown';

const $window = $(window);
const $body   = $(document.body);

const selectors = {
  header: '[data-header]',
  dropdownTrigger: '[data-dropdown-trigger][data-block]'
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

    this.$container.on(this.events.MOUSELEAVE, this.onMouseLeave.bind(this));
    this.initialPosition = 0;

    // Register each dropdown trigger
    $(selectors.dropdownTrigger, this.$container).each((i, trigger) => {
      DropdownManager.register($(trigger));
    });

    // We pass in the fixed behavior as a class on the body of the site
    if ($body.hasClass(classes.siteHasFixedHeader)) {
      $window.on(this.events.SCROLL, throttle(20, this.onScroll.bind(this)));
      this.onScroll(); // hit this one time on init to make sure everything is good
    }


    if ($body.hasClass("testerino")) {
      $window.on(this.events.SCROLL, throttle(20, this.onScroll.bind(this)));
    }
  }

  scrollCheck() {
    // Do measurements outside of rAF.
    const scrollTop = $window.scrollTop();
    const actualOffset = this.$container.offset().top;

    // Do DOM updates inside.
    requestAnimationFrame(() => {
      if (scrollTop <= actualOffset) {
        this.$el.removeClass(classes.headerFixed);
        this.$el.removeClass(classes.headerScroll);
        this.$el.removeClass(classes.showOnScroll);
        this.$el.removeClass(classes.hideOnScroll);
      }
      else {
        this.$el.addClass(classes.headerFixed);
        this.$el.addClass(classes.headerScroll);
      }
    });
  }

  positionCheck() {
   const scrollTop = $window.scrollTop();
   const actualOffset = this.$container.offset().top;
   let lastInitialPosition = this.initialPosition;

   // Do DOM updates inside.
    if (this.$el.hasClass(classes.headerScroll)) {
      requestAnimationFrame(() => {
        if (scrollTop >= lastInitialPosition) {
          this.$el.removeClass(classes.showOnScroll);
          this.$el.addClass(classes.hideOnScroll);
          this.initialPosition = scrollTop;
        }
        else {
          this.$el.addClass(classes.showOnScroll);
          this.$el.removeClass(classes.hideOnScroll);
          this.initialPosition = scrollTop;
        }
      });
    }
  }

  onScroll() {
    this.scrollCheck();

    if ($body.hasClass("testerino")) {
      this.positionCheck();    
    }  
  }

  onMouseLeave() {
    DropdownManager.closeAllDropdowns();
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
