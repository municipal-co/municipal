import $ from 'jquery';
import { getQueryParams, getUrlWithUpdatedQueryStringParameter } from '../core/utils';
import ProductCard from '../view/product/productCard';


const selectors = {
  pagination: '[data-pagination]',
  loadMoreButton: '[data-load-more-button]',
  productCard: '[data-product-card]'
}

export default class LoadMore {
  constructor(el) {
    this.name = 'loadMore';
    this.nameSpace = '.' + this.name;
    this.$el = $(el);
    // this is inside the module so cant be scoped within this.$el
    this.$gridContainer = $(this.$el.data('grid-container'));

    if (this.$gridContainer) {
      this.cardSelector = $(el).data('card-selector');
      this.$button = $(selectors.loadMoreButton, this.$container);
      this.$button.on('click', this.loadMoreItems.bind(this));
    }

    this.checkPageIndex();
  }

  loadMoreItems(e) {
    e.preventDefault();

    const self = this;
    const link = this.$el.data('url-next');
    $.ajax({
      url: link,
      dataType: 'html'
    })
    .done(function(data) {
      self.updateContentGrid(data);
      self.updateLoadMoreButton(data);
      self.updateUrl(link);
    });
  }

  updateContentGrid(data, prepend = false) {
    const $cards = $(data).find(this.cardSelector);
    if (prepend === true) {
      $cards.prependTo(this.$gridContainer);
    } else {
      $cards.appendTo(this.$gridContainer);
    }

    $(selectors.productCard).each((index, el) => {
      new ProductCard(el);
    });
  }

  updateLoadMoreButton(data) {
    const link = $(data).find(selectors.pagination).data('next-url');
    if ($.trim(link) !== '') {
      this.$el.data('url-next', link);
      this.$button.attr('href', link);
    } else {
      this.$el.hide();
    }
  }

  updateUrl(link) {
    window.history.replaceState('', '', link);
  }

  checkPageIndex() {
    const self = this;
    const queryParams = getQueryParams();
    if (typeof queryParams.page !== 'undefined' && parseInt(queryParams.page) > 1) {
      for (let i = queryParams.page - 1; i > 0; i--) {
        const newUrl = getUrlWithUpdatedQueryStringParameter('page', i, window.location.href);
        $.ajax({
          url: newUrl,
          dataType: 'html',
        })
        .done(function(data) {
          self.updateContentGrid(data, true);
        });

      }
    }
  }
}
