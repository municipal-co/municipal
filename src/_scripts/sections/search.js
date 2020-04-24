import $ from 'jquery';
import BaseSection from './base';
import SearchForm from '../managers/searchForm';
import LoadMore from '../managers/loadMore';

const selectors = {
  searchForm: '[data-search-form]',
  loadMore: '[data-pagination]'
};

export default class SearchResults extends BaseSection {
  constructor(container) {
    super(container, 'searchResults');

    this.$searchForm = $(selectors.searchForm, this.$container);
    this.$loadMore = $(selectors.loadMore, this.$container);

    this.searchForm = new SearchForm(this.$searchForm);
    this.loadMore = new LoadMore(this.$loadMore);
  }
}
