import $ from 'jquery';
import { throttle } from 'throttle-debounce';


const selectors = {
  searchForm: '[data-search-form]',
  autocompleteContainer: '[data-autocomplete-container]',
  searchInput: '[data-search-input]'
};

export default class SearchForm {

  constructor(el) {
    this.$el = $(el);
    this.$searchInput = $(selectors.searchInput, this.$el);
    this.$autocompleteContainer = $(selectors.autocompleteContainer, this.$el);

    this.$searchInput.on('click', this.runPredictiveSearch.bind(this));
    this.$searchInput.on('keyup', throttle(20, this.runPredictiveSearch.bind(this)));
    this.$searchInput.on('focus', this.runPredictiveSearch.bind(this));
    this.$autocompleteContainer.on('mouseleave', this.hidePredictiveSearch.bind(this));
    this.$el.on('submit', this.checkValidity.bind(this));
  }

  checkValidity(e) {
    const formValue = this.$searchInput.val();

    if ($.trim(formValue) === '') {
      e.preventDefault();
    }
  }

  runPredictiveSearch() {
    const self = this;
    if (this.$searchInput.val().length >= 3) {
      const searchQuery = this.$searchInput.val();

      this.$autocompleteContainer.show();
      this.autocompleteRestart();

      $.ajax({
        url: '/search/suggest.json',
        dataType: 'json',
        data: {
          q: searchQuery,
          resources: {
            type: 'product',
            options: {
              unavailable_products: 'last',
              fields: 'title'
            }
          }
        }
      })
      .done(function(data) {
        self.updateAutocompleteOptions(data);
      })
    } else {
      self.$autocompleteContainer.hide();
    }
  }

  hidePredictiveSearch() {
    this.$autocompleteContainer.hide();
  }

  autocompleteRestart() {
    const $autocompleteList = $('ul', this.$autocompleteContainer);
    const loaderItem = '<li class="autocomplete-item loader"></li>'

    $autocompleteList.empty();
    for(let i = 0; i < 3; i++) {
      $autocompleteList.append(loaderItem);
    }
  }

  updateAutocompleteOptions(data) {
    const self = this;
    const $autocompleteList = $('ul', this.$autocompleteContainer);
    const searchQuery = this.$searchInput.val();
    const productList = data.resources.results.products;

    $autocompleteList.empty();
    if (productList.length > 0) {
      $.each(productList, function(index, product) {
        const highlightedText = self._highlightText(searchQuery, product.title);
        $autocompleteList.append(`<li class="autocomplete-item"><a href="${product.url}">${highlightedText}</a></li>`);
      });
    } else {
      $autocompleteList.append('<li class="autocomplete-item">No results found</li>')
    }
  }

  _highlightText(needle, haystack) {
    const indexStart = haystack.toLowerCase().indexOf(needle.toLowerCase());
    const stringEnd = indexStart + needle.length;
    let returnText;
    if (indexStart > -1) {
      returnText = haystack.substring(0, indexStart) + '<span class="highlight">' + haystack.substring(indexStart, stringEnd) + '</span>' + haystack.substring(stringEnd);
    } else {
      returnText = haystack + ' <span class="close-result">(Closest result)</span>';
    }

    return returnText;
  }
}
