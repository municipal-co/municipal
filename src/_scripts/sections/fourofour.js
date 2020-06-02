import $ from 'jquery';
import BaseSection from './base';
import SearchForm from '../managers/searchForm';

const selectors = {
  searchForm: '[data-search-form]',
  autocompleteContainer: '[data-autocomplete-container]'
};

export default class MobileMenuSection extends BaseSection {
  constructor(container) {
    super(container, 'mobileMenu');

    this.$searchForm = $(selectors.searchForm, this.$container);

    this.searchForm = new SearchForm(this.$searchForm);
  }

  onSelect() {
  }

  onDeselect() {
  }

  onUnload() {
  }
}
