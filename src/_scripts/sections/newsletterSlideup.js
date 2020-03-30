import $ from 'jquery';
import BaseSection from './base';
import * as User from '../core/user';
import * as Utils from '../core/utils';
import Slideup from '../ui/slideup';
import NewsletterForm from '../ui/newsletterForm';

const selectors = {
  slideup: '[data-newsletter-slideup]',
  newsletterForm: '[data-newsletter-form]'
};

/**
 * Newsletter Slideup Section Script
 * ------------------------------------------------------------------------------
 *
 * Details are dependent on:
 *  - Mailing list provider (See settings_schema.json)
 *  - 3rd party ajax / validation scripts
 *
 * @namespace - newsletterSlideup
 */
export default class NewsletterSlideupSection extends BaseSection {
  constructor(container) {
    super(container, 'newsletterSlideup');

    this.settings = {
      enabled: this.$container.data('enabled'),
      // delay before showing the modal on pageload
      delay: !Number.isNaN(parseInt(this.$container.data('delay'))) ? (parseInt(this.$container.data('delay'))*1000) : 3000,
      // days before showing the modal again
      seenExpiration: !Number.isNaN(parseInt(this.$container.data('seen-expiration'))) ? parseInt(this.$container.data('seen-expiration')) : 30
    };

    // if seenExpiration is set to 0, set it to 1 year (very far into the future)
    if (this.settings.seenExpiration === 0) {
      this.settings.seenExpiration = 365;
    }

    // DOM elements we'll need
    this.$el          = $(selectors.slideup, this.$container);

    this.slideup        = new Slideup(this.$el);
    this.newsletterForm = new NewsletterForm($(selectors.newsletterForm, this.$container));
    
    // Hook up the form to an ESP here
    // this.ajaxKlaviyoForm = new AJAXKlaviyoForm...

    /**
     * These are the cookies that we'll use to keep track of how much the user has seen / interacted with the slideup
     */
    this.cookies = {};

    this.cookies.seen = User.generateCookie('newsletterSlideupSeen');
    this.cookies.seen.value = Utils.hashFromString(this.$el.text()).toString(); // Set the cookie value based on the content
    this.cookies.seen.expiration = this.settings.seenExpiration;

    /**
     * Attach event handlers
     */
    this.$el.on('hide.slideup',   this.onHide.bind(this));
    this.$el.on('hidden.slideup', this.onHidden.bind(this));

    /**
     * Checks the show logic and displays the popup if everything checks out
     */
    if (this.shouldShow()) {
      setTimeout(() => {
        this.slideup.show();
      }, this.settings.delay);
    }
  }

  shouldShow() {
    // Checks should be done in this order!

    if (Utils.isThemeEditor() || !this.settings.enabled) {
      return false;
    }

    if (this.newsletterForm.emailCollected()) {
      return false;
    }

    if (User.hasCookie(this.cookies.seen.name) && User.getCookieValue(this.cookies.seen.name) === this.cookies.seen.value) {
      return false;
    }

    return true;
  }

  onHide() {
    if (!Utils.isThemeEditor()) {
      User.setCookie(this.cookies.seen);
    }
  }

  onHidden() {
    this.newsletterForm.reset();
  }

  /**
   * Theme Editor section events below
   */
  onSelect() {
    this.slideup.show();
  }

  onDeselect() {
    this.slideup.hide();
  }
}
