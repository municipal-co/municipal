import $ from 'jquery';
import * as Utils from '../../core/utils';

const selectors = {
  sortSelect: '[data-sort-select]'
};

export default class CollectionSort {
  constructor(container, collectionData) {
    this.$container = $(container);

    this.name = 'collectionSort';
    this.namespace = `.${this.name}`;

    // Stop parsing if we don't have the collection data
    if (!collectionData) {
      return;
    }

    this.collectionData = collectionData;

    this.$container.on('change', selectors.sortSelect, this.applySort.bind(this));
  }

  applySort() {
    const sortBy = $(selectors.sortSelect, this.container).find('option:selected').val();
    const queryParams = Utils.getQueryParams();

    if (sortBy !== this.collectionData.sortDefault) {
      queryParams.sort_by = sortBy;
    }
    else {
      delete queryParams.sort_by;
    }

    window.location.search = $.param(queryParams);
  }
}
