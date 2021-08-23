import $ from 'jquery';
import { throttle } from 'throttle-debounce';
import BaseSection from './base';
import Drawer from '../ui/drawer';
import {getBreakpointMinWidthKeyForWidth, getBreakpointMinWidth} from '../core/breakpoints';


const selectors = {
  toggle: '[data-mobile-menu-toggle]',
  menu: '[data-mobile-menu]',
  autocompleteContainer: '[data-autocomplete-container]',
  mainLinkHeader: '[data-link-group-header]',
  featuredButton: '[data-featured-button]',
  submenuLink: '[data-submenu-link]',
  mobileSubmenuContainer: '[data-mobile-submenu-container]',
  desktopSubmenuContainer: '[data-desktop-submenu-container]',
  featuredImage: '[data-featured-image]',
};

const classes = {
  menuOpen: 'menu-open',
  opening: 'is-opening',
  closing: 'is-closing',
  open: 'is-open',
  subnavOpen: 'has-subnav-open',
  lazyload: 'lazyload',
}

const $window = $(window);
export default class MobileMenuSection extends BaseSection {
  constructor(container) {
    super(container, 'mobileMenu');

    this.featuredImagesLoaded = false;

    this.$el     = $(selectors.menu, this.$container);
    this.$toggle = $(selectors.toggle); // Don't scope to this.$container
    this.$searchForm = $(selectors.searchForm, this.$container);
    this.$header = $('header');

    this.drawer  = new Drawer(this.$el, {
      backdrop: false
    });

    this.$mainLinkHeader = $(selectors.mainLinkHeader, this.$container);
    this.$submenuLink = $(selectors.submenuLink, this.$container);
    this.$featuredImages = $(selectors.featuredImage, this.$container);
    this.$desktopSubmenuContainer = $(selectors.desktopSubmenuContainer, this.$container);

    this.$toggle.on(this.events.CLICK, this.onToggleClick.bind(this));
    this.$mainLinkHeader.on(`${this.events.CLICK}, ${this.events.MOUSEENTER}`, this.openSubmenu.bind(this));
    this.$desktopSubmenuContainer.on(this.events.MOUSEENTER, selectors.submenuLink, this.updateFeaturedImage.bind(this));
    $window.on('resize', throttle(20, false, this.updateNavPosition.bind(this)));
    $window.on('scroll', throttle(20, this.updateNavPosition.bind(this)));
    $window.on('breakpointChange', this._checkBreakpoint.bind(this));
    $window.on('toggleSearchDrawer', this.closeMobileNav.bind(this))
    this._initFeaturedImages();
  }

  onToggleClick(e) {
    e.preventDefault();
    this.$toggle.toggleClass(classes.open);
    $('body').toggleClass(classes.menuOpen);
    this.updateNavPosition();
    this.drawer.toggle();
    $window.trigger('toggleMobileMenu');
  }

  closeMobileNav(e) {
    e.preventDefault();
    this.$toggle.removeClass(classes.open);
    $('body').removeClass(classes.menuOpen);
    this.drawer.hide();
  }

  updateNavPosition() {
    const headerHeight = this.$header.outerHeight();
    let headerOffset = this.$header.offset().top - $window.scrollTop();
    if(headerOffset < 0){ // iOS is loading the browser navigation details
      headerOffset = 0;
    };

    const navOffset = headerHeight + headerOffset;

    this.$el.css({
      'max-height': `calc(100vh - ${navOffset}px)`,
      'top': navOffset,
    });
  }

  _initFeaturedImages(breakpoint) {
    let currentBreakpoint = breakpoint;
    if(breakpoint === undefined) {
      const currentWidth = $window.width();
      currentBreakpoint = getBreakpointMinWidthKeyForWidth(currentWidth);
    }

    if(currentBreakpoint === 'md' || currentBreakpoint === 'lg' || currentBreakpoint === 'xl') {
      this.$featuredImages.not('.lazyloaded').addClass('lazyload');
      this.featuredImagesLoaded = true;
    }
  }

  _checkBreakpoint(evt) {
    if(evt.bpMinWidthKey === 'md' || evt.bpMinWidthKey === 'lg' || evt.bpMinWidthKey === 'xl') {
      if(this.featuredImagesLoaded === false) {
        this._initFeaturedImages(evt.bpMinWidthKey);
      }
    }
  }

  _closeAllDrawers($currentHeader) {
    const $drawerHeaders = $(selectors.mainLinkHeader).not($currentHeader);
    const $openDrawers = $drawerHeaders.filter(`.${classes.open}`);

    $openDrawers.each((i, el) => {
      const $this = $(el);
      const $submenu = $this.siblings(selectors.mobileSubmenuContainer);

      if($submenu.length > 0) {
        $this.addClass(classes.closing);
        $submenu.slideUp(() => {
          $this.removeClass(`${classes.closing} ${classes.open}`);
          $submenu.removeAttr('style');
        })
      } else {
        $this.removeClass(classes.open);
      }
    })
  }

  _openFeaturedLinks($navigationHeader) {
    this.$el.removeClass(classes.subnavOpen);
    this._closeAllDrawers($navigationHeader);
    $navigationHeader.addClass(classes.open);
  }

  _openFloatingSubnav($navigationHeader, $submenu) {
    // Remove class from previous active item
    this.$mainLinkHeader.removeClass(classes.open);
    // Activates current clicked element
    $navigationHeader.addClass(classes.open);
    // Shows the floating subnav UI
    this.$el.addClass(classes.subnavOpen);
    // Clones the current submenu into the floating UI or clears the space
    if($submenu.length) {
      this.$desktopSubmenuContainer.html($submenu.html());
    } else {
      this.$desktopSubmenuContainer.html('');
    }
    // Updates the featured image from the floating UI
    this.updateFeaturedImage($navigationHeader);
  }

  _openMobileSubnav($navigationHeader, $submenu) {
    if($navigationHeader.hasClass(classes.open)) {
      $navigationHeader.addClass(classes.closing);
      $submenu.slideUp(() => {
        $submenu.removeAttr('style');
        $navigationHeader.removeClass(`${classes.open} ${classes.closing}`);
      });
    } else {
      this._closeAllDrawers($navigationHeader);

      $navigationHeader.addClass(classes.opening);
      $submenu.slideDown(() => {
        $navigationHeader.addClass(classes.open);
        $navigationHeader.removeClass(classes.opening);
        $submenu.removeAttr('style');
      })
    }
  }

  openSubmenu(evt) {
    const $navigationHeader = $(evt.currentTarget);
    const $submenu = $navigationHeader.siblings(selectors.mobileSubmenuContainer);
    const screenWidth = $(window).outerWidth(true);

    if($navigationHeader.is(selectors.featuredButton)) {
      this._openFeaturedLinks($navigationHeader);
      return false;
    }

    if($navigationHeader.attr('href') === '#') {
      evt.preventDefault();
    }

    if(screenWidth > getBreakpointMinWidth('sm')){
      this._openFloatingSubnav($navigationHeader, $submenu);
    } else {
      this._openMobileSubnav($navigationHeader, $submenu)
    }

    return true;
  }

  updateFeaturedImage(reference) {
    const $featuredImages = $(selectors.featuredImage);
    let isEvent = false;
    if(reference.hasOwnProperty('currentTarget')){
      isEvent = true;
    }
    if(isEvent) {
      const $this = $(reference.currentTarget);
      const imageId = $this.data('hover-image');
      const $currentImage = $featuredImages.filter((index, image) => {
        const $image = $(image);
        if($image.data('image-id') === imageId) {
          return true;
        };
      });

      if($currentImage.length > 0) {
        $featuredImages.hide();
        $currentImage.show();
      }
    } else {
      // Get the image ID from the main nav (if exists)
      let imageId = reference.data('image-id');
      // Get the firt sub nav item
      if(imageId === '') {
        const $firstLink = $(selectors.submenuLink, this.$desktopSubmenuContainer).eq(0);
        imageId = $firstLink.data('hover-image');
      }
      const $currentImage = $featuredImages.filter((index, image) => {
        const $image = $(image);

        if($image.data('image-id') === imageId) {
          return true;
        }
      });
      if ($currentImage.length > 0) {
        $featuredImages.hide();
        $currentImage.show();
      }
    }
  }

  onSelect() {
    this.drawer.show();
  }

  onDeselect() {
    this.drawer.hide();
  }

  onUnload() {
    this.drawer.$backdrop && this.drawer.$backdrop.remove();
  }
}
