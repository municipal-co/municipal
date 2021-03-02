import $ from 'jquery';
import BaseSection from './base';
import Drawer from '../ui/drawer';
import ProductCard from '../view/product/productCard';
import LoadMore from '../managers/loadMore';

const selectors = {
  collectionJson: '[data-collection-json]',
  promoCard: '.promo_card',
  filtersToggler: '[data-filters-toggler]',
  filtersDrawers: '[data-filters-drawer]',
  filterBar: '[data-filter-bar]',
  filterEnabler: '[data-filter-enable]',
  filterClear: '[data-filter-clear]',
  collectionGrid: '[data-collection-grid]',
  filterDot: '.dot',
  sortOption: 'input[name="sort-option"]',
  productCard: '[data-product-card]',
  loadMore: '[data-pagination]',
  loadMoreButton: '[data-load-more-button]',
  gridItem: '[data-grid-item]'
};

const classes = {
  fixed: 'is-fixed',
  active: 'is-active',
  empty: 'is-empty'
};

export default class CollectionSection extends BaseSection {
  constructor(container) {
    super(container, 'collection');

    window.getCollectionJson = function() {
      return JSON.parse($('[data-collection-json]').html());
    }

    // Stop parsing if we don't have the collection json script tag
    if (!$(selectors.collectionJson, this.$container).html()) {
      console.warn(`[${this.name}] - Element matching ${selectors.collectionJson} required.`);
      return;
    }

    this.collectionData = JSON.parse($(selectors.collectionJson, this.$container).html());
    this.collectionSections = $('.collection-section', this.$container);
    this.background = this.$container.data('background-color');
    this.$loadMore = $(selectors.loadMore, this.$container);
    this.$promoCard = $(selectors.promoCard, this.$container);
    // filters controllers
    this.$filterBar = $(selectors.filterBar, this.$container);

    if (this.$filterBar.length) {
      this.$drawer = $(selectors.filtersDrawers, this.$container);
      this.filterBarPosition = this.$filterBar.offset().top;
      this.$filtersEnabler = $(selectors.filterEnabler);
      this.localFiltering = this.$filtersEnabler.data('local-filtering');
      this.drawer =  new Drawer(this.$drawer);

      $(selectors.filtersToggler, this.$container).on('click', this.toggleFilters.bind(this));
      this.$filtersEnabler.on('click', this.enableFilters.bind(this));
      $(selectors.filterClear, this.$container).on('click', this.clearFilters.bind(this));
      $(selectors.filterDot, this.$container).on('click', this.onDotclick.bind(this));
    }

    // Initialize load more
    this.$loadMore.each((index, el) => {
      new LoadMore($(el))
    })
  }

  toggleFilters() {
    this.drawer.toggle();
  }

  enableFilters() {
    if (this.localFiltering) {
      this._performLocalFiltering.call(this);
    } else {
      this._performMultipleCollectionFiltering.call(this);
    }
  }

  onDotclick(e) {
    const $this = $(e.currentTarget);

    if (!$this.hasClass(classes.active)) {
      $this.addClass(classes.active).siblings().removeClass(classes.active);
    } else {
      $this.removeClass(classes.active);
    }
  }

  _performLocalFiltering() {
    const self = this;
    const filterTags = [];
    const sortOption = $(selectors.sortOption + ':checked').val();
    const collectionUrl = this.collectionData.url;

    $(selectors.filterDot, this.$drawer).each((index, el) => {
      if ($(el).hasClass(classes.active)) {
        const tag = $(el).data('value');
        filterTags.push(tag);
      }
    });

    const filterHandles = filterTags.join('+');
    let filterUrl = collectionUrl + '/' + filterHandles;

    if (sortOption !== '' && typeof sortOption !== 'undefined') {
      filterUrl = filterUrl + '?sort_by=' + sortOption;
    }
    if (filterTags.length > 0 || typeof sortOption !== 'undefined') {
      $.ajax({
        url: filterUrl,
        dataType: 'html'
      })
      .done(function(data) {
        self.updateCollection(data);
        self.updateUrl(filterUrl);
        self.updateLoadMoreStatus(data);
        self.collectionData.filterUrl = filterUrl;
        self.drawer.hide();
      });
      this.updateScrollPosition();
    }
  }

  _performMultipleCollectionFiltering() {
    const self = this;
    const filterTags = [];
    const sortOption = $(selectors.sortOption + ':checked').val();

    $(selectors.filterDot, this.$drawer).each((index, el) => {
      if ($(el).hasClass(classes.active)) {
        const tag = $(el).data('value');
        filterTags.push(tag);
      }
    });

    const filterHandles = filterTags.join('+');

    $(selectors.collectionGrid).each((index, el) => {
      const $el = $(el);
      const baseUrl = $el.data('collection-url');
      let filterUrl = baseUrl + '/' + filterHandles;

      if (sortOption !== '' && typeof sortOption !== 'undefined') {
        filterUrl = filterUrl + '?sort_by=' + sortOption;
      }

      if (filterTags.length > 0 || typeof sortOption !== 'undefined') {
        $.ajax({
          url: filterUrl,
          dataType: 'html'
        })
        .done(function(data) {
          self.updateCollection(data, $el);
          self.updateLoadMoreStatus(data, $el);
          self.collectionData.filterUrl = filterUrl;
          self.drawer.hide();
        });
        this.updateScrollPosition();
      }
    });
  }

  updateCollection(data, $grid) {
    const gridItems = $(data).find(selectors.gridItem);
    if (typeof $grid === 'undefined') {
      $(selectors.collectionGrid, this.$container).empty().append(gridItems);
    } else if (gridItems.length > 0) {
      $grid.removeClass(classes.empty);
      $grid.empty().append(gridItems);
    } else {
      $grid.addClass(classes.empty);
      $grid.empty().append('<p class="p1">The filters you selected thrown no results for this collection</p>')
    }

    $(selectors.productCard).each((index, el) => {
      new ProductCard(el);
    });
  }

  updateUrl(newUrl) {
    window.history.pushState('Filter Page', null, newUrl );
  }

  updateLoadMoreStatus(data, $grid) {
    const $newLoadMore = $(data).find(selectors.loadMore);
    let newUrl;
    let $loadMore;
    let $loadMoreButton;

    if ($newLoadMore.length) {
      newUrl = $newLoadMore.data('url-next');
    }

    if (typeof $grid !== 'undefined') {
      $loadMore = $grid.siblings(selectors.loadMore);
      $loadMoreButton = $(selectors.loadMoreButton, $loadMore);
    } else {
      $loadMore = $(selectors.loadMore);
      $loadMoreButton = $(selectors.loadMoreButton);
    }

    if (typeof newUrl !== 'undefined') {
      $loadMore.attr('data-url-next', newUrl);
      $loadMore.data('url-next', newUrl);
      $loadMoreButton.attr('href', newUrl);
      $loadMore.show();
    } else {
      $loadMore.hide();
    }
  }

  clearFilters(e) {
    e.preventDefault();
    if (this.localFiltering) {
      this._clearSingleCollectionFilter.call(this);
    } else {
      this._clearMultipleCollectionFilters.call(this);
    }
  }

  _clearSingleCollectionFilter() {
    const self = this;
    const collectionUrl = this.collectionData.url;
    if (this.collectionData.filterUrl !== '' && typeof this.collectionData.filterUrl !== 'undefined' ) {
      $.ajax({
        url: collectionUrl,
        dataType: 'html'
      })
      .done(function(data) {
        self.updateCollection(data);
        self.updateUrl(collectionUrl);
        self.unselectFilters();
        self.updateLoadMoreStatus(data);
        self.collectionData.filterUrl = '';
        self.drawer.hide();
      });
      this.updateScrollPosition();
    } else {
      this.unselectFilters.call(this);
    }
  }

  _clearMultipleCollectionFilters() {
    const self = this;
    if (this.collectionData.filterUrl !== '' && typeof this.collectionData.filterUrl !== 'undefined' ) {
      $(selectors.collectionGrid).each((index, el) => {
        const $el = $(el);
        const baseUrl = $el.data('collection-url');

        $.ajax({
          url: baseUrl,
          dataType: 'html'
        })
        .done(function(data) {
          self.updateCollection(data, $el);
          self.updateLoadMoreStatus(data, $el);
          self.unselectFilters();
          self.collectionData.filterUrl = '';
          self.drawer.hide();
        });
      });
      this.updateScrollPosition();
    } else {
      self.unselectFilters.call(this);
    }
  }

  unselectFilters() {
    $(selectors.filterDot).removeClass(classes.active);
    $(selectors.sortOption).prop('checked', false);
  }

  updateScrollPosition() {
    $('body, html').animate({
      scrollTop: this.filterBarPosition
    }, 300);
  }
}
