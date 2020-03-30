import $ from 'jquery';
import * as Utils from '../core/utils';
import * as User from '../core/user';
import { getTransitionTimingDuration } from '../core/animations';

const selectors = {
  form: 'form',
  formContents: '[data-form-contents]',
  formMessage: '[data-form-message][data-message-success][data-message-fail]'
};

const classes = {
  showMessage: 'show-message',
};

export default class NewsletterForm {
  /**
   * NewsletterForm constructor
   *
   * @param {HTMLElement} el - Element used for scoping any element selection.  Can either be a containing element or the form element itself
   * @param {Object} options
   */  
  constructor(el, options) {
    this.name = 'newsletterForm';

    const defaults = {
      setCookies: true // toggle setting of browser cookies
    };

    this.settings = $.extend({}, defaults, options);
    this.transitionEndEvent     = Utils.whichTransitionEnd();
    this.supportsCssTransitions = !!Modernizr.csstransitions;

    this.$el = $(el);
    this.$form = this.$el.is(selectors.form) ? this.$el : this.$el.find(selectors.form);
    this.timeout = null;
    
    if (!this.$form.length) {
      console.warn(`[${this.name}] - Form element required to initialize`);
      return;
    }

    this.$formContents = $(selectors.formContents, this.$el);
    this.$formMessage  = $(selectors.formMessage, this.$el);

    /**
     * These are the cookies that we'll use to keep track of how much the user has interacted with the footer
     */
    this.cookies = {};

    this.cookies.emailCollected = User.generateCookie('emailCollected');
  }

  emailCollected() {
    return User.hasCookie(this.cookies.emailCollected.name);
  }

  /**
   * Temporarily shows the form message
   *
   * @param {Boolean} reset - If set, will call this.reset
   */  
  showMessageWithTimeout(reset = false) {
    this.$formContents.addClass(classes.showMessage);

    window.clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      if (reset) {
        this.reset();
      }
      else {
        this.$formContents.removeClass(classes.showMessage);
      }
    }, 4000);
  }

  /**
   * Resets everything to it's initial state.  Only call when form content isn't visible
   */
  reset() {
    this.$form.find('input[type="email"]').val('');
    this.$form.find('input[type="checkbox"]').prop('checked', false);

    const cb = this.$formMessage.html.bind(this.$formMessage, '');

    if (this.supportsCssTransitions) {
      this.$formContents.one(this.transitionEndEvent, cb);
    }
    else {
      setTimeout(cb, getTransitionTimingDuration('base'));
    }

    this.$formContents.removeClass(classes.showMessage);
  }

  onSubscribeSuccess(response) {
    const isSubscribed = response && response.data && response.data.is_subscribed;
    const successMsg = this.$formMessage.data(isSubscribed ? 'message-already-subscribed' : 'message-success');

    if (!Utils.isThemeEditor() && this.settings.setCookies) {
      User.setCookie(this.cookies.emailCollected);
    }

    this.$formMessage.html(successMsg);

    // Don't reset the form if they're already subscribed, they might want to just enter a different email
    this.showMessageWithTimeout(!isSubscribed);
  }

  onSubmitFail(errors) {
    this.$formMessage.html(Array.isArray(errors) ? errors.join('  ') : errors);
    this.showMessageWithTimeout();
  }

  onSubscribeFail() {
    this.$formMessage.html(this.$formMessage.data('message-fail'));
    this.showMessageWithTimeout();
  }
}
