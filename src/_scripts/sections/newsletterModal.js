import $ from 'jquery';
import BaseSection from './base';
import * as User from '../core/user';
import * as Utils from '../core/utils';
import NewsletterForm from '../ui/newsletterForm';

const selectors = {
  modal: '[data-newsletter-modal]',
  newsletterForm: '[data-newsletter-form]'
};

/**
 * Newsletter Modal Section Script
 * ------------------------------------------------------------------------------
 *
 * Details are dependent on:
 *  - Mailing list provider (See settings_schema.json)
 *  - 3rd party ajax / validation scripts
 *
 * @namespace - newsletterModal
 */
export default class NewsletterModalSection extends BaseSection {
  constructor(container) {
    super(container, 'newsletterModal');

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
    this.$modal          = $(selectors.modal, this.$container);

    this.newsletterForm = new NewsletterForm($(selectors.newsletterForm, this.$container));
    
    /**
     * These are the cookies that we'll use to keep track of how much the user has seen / interacted with the popup
     */
    this.cookies = {};

    this.cookies.seen = User.generateCookie('newsletterModalSeen');
    this.cookies.seen.value = Utils.hashFromString(this.$modal.text()).toString(); // Set the cookie value based on the content
    this.cookies.seen.expiration = this.settings.seenExpiration;

    /**
     * Attach event handlers
     */
    this.$modal.on('shown.bs.modal', this.onShown.bind(this));
    this.$modal.on('hidden.bs.modal', this.onHidden.bind(this));

    /**
     * Checks the show logic and displays the popup if everything checks out
     */
    if (this.shouldShow()) {
      setTimeout(this.show.bind(this), this.settings.delay);
    }
  }

  hide() {
    this.$modal.modal('hide');
    if (!Utils.isThemeEditor()) {
      User.setCookie(this.cookies.seen);
    }
  }

  show() {
    this.$modal.modal('show');
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

  onShown() {
    // $(selectors.emailInput).focus();
  }

  onHidden() {
    if (!Utils.isThemeEditor()) {
      User.setCookie(this.cookies.seen);
    }
  }

  /**
   * Theme Editor section events below
   */
  onSelect() {
    this.show();
  }

  onDeselect() {
    this.hide();
  }

  onUnload() {
    $('.modal-backdrop').remove();
  }
}
