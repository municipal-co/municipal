import $ from 'jquery';
import Handlebars from 'handlebars';
import Instafeed from 'instafeed.js';
import BaseSection from './base';

const selectors = {
  target: '[data-instagram-feed-target]',
  template: 'script[data-instagram-media-template]'
};

export default class InstagramFeedSection extends BaseSection {
  constructor(container) {
    super(container, 'instagramFeed');

    this.$target = $(selectors.target, this.$container);

    // Compile this once during initialization
    this.template = Handlebars.compile($(selectors.template).html());

    this.settings = {
      accessToken: this.$container.attr('data-access-token'),
      get: 'user',
      mock: true,
      success: this.onInstafeedMockSuccess.bind(this),
      limit: this.$container.attr('data-limit') || 8
    };

    if (!this.settings.accessToken) {
      console.warn('[InstagramFeed] - An access token is required to interact with the Instagram API');
      return;
    }

    this.init();
  }

  /**
   * Kick off the network requests.  Retrieve the user profile from the API and then fire up the feed.
   *
   */
  init() {
    $.ajax({
      type: 'GET',
      url: 'https://api.instagram.com/v1/users/self?access_token=' + this.settings.accessToken,
      dataType: 'jsonp'
    })
      .then((response) => {
        // Handle invalid response
        if (response.meta.hasOwnProperty('error_message')) {
          console.warn(`[${this.name}] - response.meta.error_message`);
          return;
        }

        this.settings.userId = response.data.id;

        /*
         *  Use this space to make any adjustments to the section now that you have access to the user profile object
         */

        this.feed = new Instafeed(this.settings);
        this.feed.run();
      });
  }

  /**
   * Callback that runs after Instafeed.run() if the 'mock' setting is set to true
   * Use this function to sort through images, select proper resolution, and construct a gallery of images to insert into the DOM
   *
   * @param {Object} feed - object returned from Instagram API
   * @param {Array} feed.data - Array of feed data objects containing images + info
   */
  onInstafeedMockSuccess(feed) {
    feed.data.forEach((photo) => {
      const data = {
        url: photo.link,
        src: photo.images && photo.images.standard_resolution && photo.images.standard_resolution.url,
        caption: (photo.caption && photo.caption.text) || ''
      };

      this.$target.append(this.template(data));
    });
  }
}
