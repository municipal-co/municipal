import $ from 'jquery';
import * as Utils from '../../core/utils';

const selectors = {
  filterSelect: '[data-filters-type][data-filters-type-select]',
  mobileFilterGroup: '[data-mobile-filter-group]',
  mobileFilterTag: '[data-mobile-filter-tag][data-mobile-filter-type]',
  mobileFilterApply: '[data-mobile-filter-apply]'
};

const classes = {
  mobileFilterTagSelected: 'is-selected'
};

const sortingFunctions = {

  /**
   * Sorts sizes based on a predefined order
   *
   * @param (string) a
   * @param (string) b
   * @return (int)
   */
  size(a, b) {
    console.warn('[collectionFilters] - sortingFunctions.size - This method hasn\'t been implemented yet.');
    // Implement this so sizes show up how we expect them to? small, med, large..
  }
};

export default class CollectionFilters {
  /**
   * CollectionFilters constructor
   *
   * @param {HTMLElement} container - Container element used for scoping any element selection
   * @param {Object} collectionData - see the bottom of `sections/collection.liquid`
   */  
  constructor(container, collectionData) {
    this.$container = $(container);
    
    this.name = 'collectionFilters';
    this.namespace = `.${this.name}`;

    // Stop parsing if we don't have the collection data
    if (!collectionData) {
      return;
    }

    this.collectionData = collectionData;

    this.$filterSelects    = $(selectors.filterSelect, this.$container);
    this.$mobileFilterTags = $(selectors.mobileFilterTag, this.$container);

    this.$container.on('change', selectors.filterSelect, this.onFilterSelectChange.bind(this));
    this.$container.on('click',  selectors.mobileFilterTag, this.onMobileFilterTagClick.bind(this));
    this.$container.on('click',  selectors.mobileFilterApply, this.onMobileFilterApplyClick.bind(this));

    this._sortFilters();
  }

  /**
   * Returns a url for the current collection with selected tags
   *
   * @return {string} - url
   */
  _getCollectionUrlWithTags(tags) {
    const collectionUrl = this.collectionData.url;
    
    tags = tags || [];

    tags = tags.map((str) => {
      return str
        .toLowerCase()
        .replace(/[^\w\u00C0-\u024f]+/g, '-')
        .replace(/^-+|-+$/g, '');
    });

    return tags.length ? collectionUrl + '/' + tags.join('+') : collectionUrl;
  }

  _getSelectedTags() {
    return $.map(this.$filterSelects.find('option:selected'), (opt, i) => {
      let o;
      // Make sure we don't push empty strings
      if ($(opt).val()) {
        o = $(opt).val();
      }
      return o;
    });
  }

  _getSelectedMobileTags() {
    return $.map(this.$mobileFilterTags, (tag, i) => {
      let t;
      if ($(tag).hasClass(classes.mobileFilterTagSelected)) {
        t = $(tag).data('mobile-filter-tag');
      }
      return t;
    });
  }

  /**
   * Sorts the filter options inside each select tag if there is an applicable sort function available
   */
  _sortFilters() {
    this.$filterSelects.each(function() {
      const $select = $(this);
      const $toSort = $select.find('option');
      const sortingFunction = sortingFunctions[$select.data('filters-type')];

      if (sortingFunction) {
        $toSort.sort((a, b) => {
          return sortingFunction($(a).val(), $(b).val());
        });
      }
    });
  }

  /**
   * Redirects the browser to the passed in URL while mainting the query string
   *
   * @param (string) url
   */
  redirect(url) {
    window.location.href = url + Utils.getQueryString();
  }

  /**
   * Redirects the browser to the collection page without any filters applied
   */
  clear() {
    window.location.href = this.collectionData.url + Utils.getQueryString();
  }

  /**
   * Applies the selected filter options
   * Looks for selected options and creates a URL for them, then redirects the browser
   *
   * @param (event) e - click event
   */
  onFilterSelectChange(e) {
    const selectedTags = this._getSelectedTags();
    const url = this._getCollectionUrlWithTags(selectedTags);

    this.redirect(url);
  }

  /**
   * Toggles the selected class for the clicked on filter tag while removing the selected class from other filter tags in the same group
   *
   * @param (event) e - click event
   */
  onMobileFilterTagClick(e) {
    e.preventDefault();

    const $tag = $(e.currentTarget);
    const tagIsSelected = $tag.hasClass(classes.mobileFilterTagSelected);
    
    $tag.parents(selectors.mobileFilterGroup).find(selectors.mobileFilterTag).removeClass(classes.mobileFilterTagSelected);

    if (!tagIsSelected) {
      $tag.addClass(classes.mobileFilterTagSelected);
    }
  }

  /**
   * Applies the selected mobile filter tags.
   * Looks for selected tags and creates a URL for them, then redirects the browser
   *
   * @param (event) e - click event
   */
  onMobileFilterApplyClick(e) {
    e.preventDefault();

    const selectedTags = this._getSelectedMobileTags();
    const url = this._getCollectionUrlWithTags(selectedTags);

    this.redirect(url);
  }
}
