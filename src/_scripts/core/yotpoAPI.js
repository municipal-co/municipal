import $ from 'jquery';

/**
 * Yotpo API Wrapper
 * -----------------------------------------------------------------------------
 * Library for interacting with the Yotpo API
 * Wraps all API calls with a promise interface
 * see: https://apidocs.yotpo.com/reference
 *
 * - Requires:
 *   - window.yotpoConfig - object with valid `apiKey` property
 */

const API_ORIGIN = 'https://api.yotpo.com';

class YotpoAPI {
  constructor() {
    this.name = 'yotpoAPI';
    this.namespace = `.${this.name}`;

    if (!window.yotpoConfig || !window.yotpoConfig.hasOwnProperty('appKey')) {
      console.warn(`[${this.name}] - App key required to initialize.  If Yotpo isn\'t required, please remove this file.`);
      return;
    }

    this.appKey = window.yotpoConfig.appKey;
  }

  /**
   * Makes a request to the Yotpo API
   * Returns the data as shown in the API docs
   *
   * @param {string} endpoint - combines with the API_ORIGIN to create a full URL
   * @returns {promise}
   * @resolve {object}
   * @rejects {object}
   */
  _makeRequest(endpoint) {
    const promise = $.Deferred();
    const url = API_ORIGIN + endpoint;

    $.get(url)
      .done((data) => {
        promise.resolve(data);
      })
      .fail((data) => {
        promise.reject(data.responseJSON);
      });

    return promise;
  }

  /**
   * Retrieves all images generated from product reviews and/or Instagram.
   * See: https://apidocs.yotpo.com/reference#get-all-images
   *
   * @param {string} source - optional - must be "instagram" or "yotpo_reviews", defaults to "instagram";
   * @param {object} params - plain object of key values mapping to optional query parameters defined in the docs.
   * @returns {promise} - see this._makeRequest
   */
  getAllImages(source, params) {
    const baseParams = { source: 'instagram' };

    if (source === 'yotpo_reviews') {
      baseParams.source = 'yotpo_reviews';
    }

    params = params || {};

    const endpoint = `/v1/widget/${this.appKey}/images/all.json?`;

    const url = endpoint + $.param($.extend(baseParams, params));

    return this._makeRequest(url);
  }

  /**
   * Retrieves images for specific products by product_id
   * See: https://apidocs.yotpo.com/reference#get-all-images
   *
   * @param {integer} id
   * @param {object} params - plain object of key values mapping to optional query parameters defined in the docs.    
   * @returns {promise} - see this._makeRequest
   */
  getProductImages(id, params) {
    if (!id) {
      console.warn(`[${this.name}] - product id required.`);
      return false;
    }

    params = params || {};

    const endpoint = `/v1/widget/${this.appKey}/albums/product/${id}`;

    const url = endpoint + $.param(params);

    return this._makeRequest(url);
  }

  /**
   * Retrieve an album by name
   * See: https://apidocs.yotpo.com/v1.0/reference?showHidden=dfd93#custom-albums
   *
   * @param {string} album name
   * @param {object} params - plain object of key values mapping to optional query parameters defined in the docs.    
   * @returns {promise} - see this._makeRequest
   */
  getCustomAlbum(albumName, params) {
    if (!albumName) {
      console.warn(`[${this.name}] - album name required.`);
      return false;
    }

    params = params || {};
    
    let endpoint = `/v1/widget/${this.appKey}/albums/by_name?album_name=${encodeURI(albumName)}`;
    
    endpoint += `&${$.param(params)}`;
    
    return this._makeRequest(endpoint);
  }

  /**
   * Retrieve Reviews for a Product
   * See: https://apidocs.yotpo.com/reference#retrieve-a-review-by-review-id
   *
   * @param {integer} id
   * @param {object} params - plain object of key values mapping to optional query parameters defined in the docs.    
   * @returns {promise} - see this._makeRequest
   */
  getReviewsForProduct(id, params) {
    if (!id) {
      console.warn(`[${this.name}] - product id required.`);
      return false;
    }

    params = params || {};

    const endpoint = `/v1/widget/${this.appKey}/products/${id}/reviews.json?`;
    
    const url = endpoint + $.param(params);

    return this._makeRequest(url);
  }

  /**
   * Retrieve Bottom Line (Total Reviews and Average Score) for a Specific Product
   * See: https://apidocs.yotpo.com/reference#get-bottom-line-total-reviews-and-average-score-fo-1
   *
   * @param {integer} id
   * @returns {promise} - see this._makeRequest
   */
  getBottomLineForProduct(id) {
    if (!id) {
      console.warn(`[${this.name}] - product id required.`);
      return false;
    }

    const endpoint = `/products/${this.appKey}/${id}/bottomline`;
    
    return this._makeRequest(endpoint);
  }

  /**
   * Retrieve Bottom Line (Total Reviews and Average Score) for All Site Reviews
   * See: https://apidocs.yotpo.com/reference#retrieve-bottom-line-for-all-site-reviews
   *
   * @returns {promise} - see this._makeRequest
   */
  getBottomLineForAllReviews() {
    const endpoint = `/products/${this.appKey}/yotpo_site_reviews/bottomline`;

    return this._makeRequest(endpoint);
  }
}

export default new YotpoAPI();
