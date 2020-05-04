import $ from 'jquery';
import { throttle } from 'throttle-debounce';
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
  active: 'is-active'
};

export default class CollectionSection extends BaseSection {
  constructor(container) {
    super(container, 'collection');

    // Stop parsing if we don't have the collection json script tag
    if (!$(selectors.collectionJson, this.$container).html()) {
      console.warn(`[${this.name}] - Element matching ${selectors.collectionJson} required.`);
      return;
    }

    const self = this;
    this.$drawer = $(selectors.filtersDrawers, this.$container);
    this.$filterBar = $(selectors.filterBar, this.$container);
    this.filterBarPosition = this.$filterBar.offset().top;
    this.collectionData = JSON.parse($(selectors.collectionJson, this.$container).html());
    this.collectionSections = $('.collection-section', this.$container);
    this.background = this.$container.data('background-color');
    this.$filtersEnabler = $(selectors.filterEnabler);
    this.localFiltering = this.$filtersEnabler.data('local-filtering');
    this.$loadMore = $(selectors.loadMore, this.$container);

    this.observerProperties = {
      root: null,
      threshold: 0.1
    }

    this.collectionSections.each(function() {
      self.IntersectionObserver = new IntersectionObserver(self.observerCallback.bind(self), self.observerProperties);
      self.IntersectionObserver.observe(this);
    });

    this.$promoCard = $(selectors.promoCard, this.$container);
    this.drawer =  new Drawer(this.$drawer);

    $(window).on('breakpointChange', this.updateFilterBarPosition.bind(this));
    $(selectors.filtersToggler, this.$container).on('click', this.toggleFilters.bind(this));
    $(window).on('scroll', throttle(100, this.onWindowScroll.bind(this)));
    this.$filtersEnabler.on('click', this.enableFilters.bind(this));
    $(selectors.filterClear, this.$container).on('click', this.clearFilters.bind(this));
    $(selectors.filterDot, this.$container).on('click', this.onDotclick.bind(this));

    // Execute this once to ensure the sticky bar is correctly positioned.
    this.onWindowScroll.call(this);

    // Initialize load more
    this.$loadMore.each((index, el) => {
      new LoadMore($(el))
    })
  }

  updateFilterBarPosition() {
    this.$filterBar.removeClass(classes.fixed);
    this.filterBarPosition = this.$filterBar.offset().top;
    this.onWindowScroll();
  }

  toggleFilters() {
    this.drawer.toggle();
  }

  onWindowScroll() {
    if (this.$promoCard.length) {
      const rotate = $(window).scrollTop() / 10;
      $('.promo_card__image', this.$promoCard).css({ transform: 'rotate(-' + rotate + 'deg)' });
    }

    if ($(window).scrollTop() >= this.filterBarPosition && !this.$filterBar.hasClass(classes.fixed)) {
      this.$filterBar.addClass(classes.fixed);
      this.$filterBar.parent().css('height', this.$filterBar.outerHeight(true));
    } else if($(window).scrollTop() < this.filterBarPosition && this.$filterBar.hasClass(classes.fixed)) {
      this.$filterBar.removeClass(classes.fixed);
      this.$filterBar.parent().css('height', 'auto');
    }
  }

  observerCallback(entries, observer) {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0.1 && this.background !== '') {
        $('body').css('background-color', this.background);
      }
    })
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
    } else {
      $grid.empty().append(gridItems);
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
    if ($newLoadMore.length) {
      newUrl = $newLoadMore.data('url-next');
    }

    if (typeof $grid !== 'undefined') {
      const $loadMore = $grid.siblings(selectors.loadMore);
      const $loadMoreButton = $(selectors.loadMoreButton, $loadMore);

      if (typeof newUrl !== 'undefined') {
        $loadMore.attr('data-url-next', newUrl);
        $loadMoreButton.attr('href', newUrl);
        $loadMore.show();
      } else {
        $loadMore.hide();
      }
    } else {
      const $loadMore = $(selectors.loadMore);
      const $loadMoreButton = $(selectors.loadMoreButton);

      if (newUrl) {
        $loadMore.attr('data-url-next', newUrl);
        $loadMoreButton.attr('href', newUrl);
        $loadMore.show();
      } else {
        $loadMore.hide();
      }
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
