import $ from 'jquery';
import BaseSection from './base';
import Drawer from '../ui/drawer';
import SearchForm from '../managers/searchForm';

const selectors = {
  toggle: '[data-mobile-menu-toggle]',
  menu: '[data-mobile-menu]',
  searchForm: '[data-search-form]',
  autocompleteContainer: '[data-autocomplete-container]'
};

export default class MobileMenuSection extends BaseSection {
  constructor(container) {
    super(container, 'mobileMenu');

    this.$el     = $(selectors.menu, this.$container);
    this.$toggle = $(selectors.toggle); // Don't scope to this.$container
    this.$searchForm = $(selectors.searchForm, this.$container);

    this.drawer  = new Drawer(this.$el);
    this.searchForm = new SearchForm(this.$searchForm);

    this.$toggle.on('click', this.onToggleClick.bind(this));
  }

  onToggleClick(e) {
    e.preventDefault();
    this.drawer.toggle();
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
