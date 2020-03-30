import $ from 'jquery';
import { debounce } from 'throttle-debounce';

/**
 * Suggested Search Functionality
 * -----------------------------------------------------------------------------
 * Adds suggested search functionality to a form input.
 * Listens to key events on the input and fetches results from the search.json template
 * Only responsible for fetching data on debounced keyup
 * Combine with callback methods to create a nice UI
 *
 * Usage:
 *
 *   import SuggestedSearch from './suggestedSearch';
 *
 *   const $input = $('form').find('input[type="search"]');
 *   const ss = new SuggestedSearch($input, {
 *     minCharacters: 4,
 *     onRequestStart: () => {
 *       // ...
 *     }
 *   });
 *
 * @namespace suggestedSearch
 */

export default class SuggestedSearch {
  /**
   * Suggested Search Constructor
   *
   * @constructor
   * @param {jQuery} $input - form input to listen to keyup events on
   * @param {Object} options
   */  
  constructor($input, options) {
    this.name = 'suggestedSearch';

    if (!$input || $input.length === 0) {
      console.warn(`[${this.name}] - Input required to initialize.`);
      return;
    }

    const defaults = {
      minCharacters: 3,
      debounceInterval: 200,
      onRequestStart: $.noop,
      onRequestEnd: $.noop,
      onNoResults: $.noop,
      onResults: $.noop,
      onInsufficientCharacters: $.noop,
      onDebouncedKeyup: $.noop
    };

    this.cache = [];
    this.request = null;
    this.lastSearchTerm = '';
    this.settings = $.extend({}, defaults, options);

    this.$input = $input;

    // Prevent the browser from offering suggestions
    this.$input.attr('autocomplete', 'off');

    this.$input.on('change keyup', debounce(this.settings.debounceInterval, this.onDebouncedKeyup.bind(this)));
  }

  makeRequest(term) {
    // Make a copy of the term so we can return it unchanged
    let q = term;

    // If the term doesn't already have asterisks in it, wrap the term to make the whole thing a wildcard match
    if (q.indexOf('*') === -1) {
      q = `*${q}*`;
    }

    // Make sure we cancel any outstanding requests
    this.request && this.request.abort();

    if (term === this.lastSearchTerm) {
      return;
    }

    if (this.cache[term]) {
      this.onRequestDone(term, this.cache[term]);
      return;
    }

    this.request = $.ajax({
      url: '/search',
      data: {
        q: q,
        type: 'product',
        view: 'json'
      },
      dataType: 'json',
      beforeSend: this.settings.onRequestStart
    })
      .done((data) => {
        this.lastSearchTerm = term;
        this.onRequestDone(term, data);
      })
      .fail(console.warn.bind('error'))
      .always(this.settings.onRequestEnd);
  }

  onRequestDone(term, data) {
    this.request = null;
    this.cache[term] = data;

    data.results_count === 0 ? this.settings.onNoResults(data) : this.settings.onResults(data);
  }
  
  onDebouncedKeyup(e) {
    const val = this.$input.val();

    if (val && val.length >= this.settings.minCharacters) {
      this.makeRequest(val);
    }
    else {
      this.settings.onInsufficientCharacters();
    }

    this.settings.onDebouncedKeyup(e);
  }
}
