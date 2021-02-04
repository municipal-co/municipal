import $ from 'jquery';
import { throttle } from 'throttle-debounce';
import BaseSection from './base';
import Drawer from '../ui/drawer';

const selectors = {
  toggle: '[data-search-drawer-toggle]',
  searchDrawer: '[data-search-drawer]',
  closeDrawer: '[data-drawer-close]',
  header: '[data-header]',
  pencilBanner: '[data-pencil-banner]'
};

const $window = $(window);
const $body = $(document.body);

export default class SearchDrawer extends BaseSection {
  constructor(container) {
    super(container, 'searchDrawer');

    this.$el     = $(selectors.menu, this.$container);
    this.$toggle = $(selectors.toggle);
    this.$closeDrawer = $(selectors.closeDrawer, this.$container);
    this.$drawer  = $(selectors.searchDrawer, this.$container);
    this.$header = $(selectors.header);

    this.$toggle.on('click', this.onToggleClick.bind(this));
    this.$closeDrawer.on('click', this.onCloseDrawer.bind(this));
    $window.on("showing-header", this.onShowHeader.bind(this));
  }

  onToggleClick(e) {
    e.preventDefault();
    const topDistance = $(selectors.header).innerHeight();
    this.$drawer.toggleClass("is-visible");

    if (this.$drawer.hasClass('is-visible')) {
      this.$drawer.css("transform", "translateY("+ topDistance +"px)");
    } else {
      this.$drawer.css("transform", "translateY(-100%)");
    }
  }

  onCloseDrawer(e) {
    this.$drawer.removeClass("is-visible");
    this.$drawer.css("transform", "translateY(-100%)");
  }

  onShowHeader() {
    const self = this;
    
    if (this.$drawer.hasClass('is-visible')) {
      setTimeout(function(){
        const topDistance = self.$header.innerHeight();
        self.$drawer.css("transform", "translateY("+ topDistance +"px)");
      }, 300);
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
