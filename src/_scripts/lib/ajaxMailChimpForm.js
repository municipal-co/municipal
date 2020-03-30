import $ from 'jquery';

/**
 * AJAX MailChimp Library
 * -----------------------------------------------------------------------------
 * Heavily modified version of the original jQuery plugin - https://github.com/scdoshi/jquery-ajaxchimp
 * Handles AJAX form submission and provides hooks for lifecycle events.
 *
 * Usage:
 *
 *   import AJAXMailChimpForm from './ajaxMailChimpForm';
 *
 *   const $form = $('form');
 *   const ajaxForm = new AJAXMailChimpForm($form, {
 *     onInit: () => {
 *       // ...
 *     }
 *   });
 *
 * @namespace ajaxMailChimpForm
 */

/* eslint-disable */
const regexes = {
  error: {
    1: /Please enter a value/,
    2: /An email address must contain a single @/,
    3: /The domain portion of the email address is invalid \(the portion after the @: (.+)\)/,
    4: /The username portion of the email address is invalid \(the portion before the @: (.+)\)/,
    5: /This email address looks fake or invalid. Please enter a real email address/,
    6: /.+\#6592.+/,
    7: /(.+@.+) is already subscribed to list (.+)\..+<a href.+/
  }
};
/* eslint-enable */

const responses = {
  success: 'Thank you for subscribing!',
  error: {
    1: 'Please enter an email address',
    2: 'There was a problem with your entry. Please check the address and try again.',
    3: 'There was a problem with your entry. Please check the address and try again.',
    4: 'There was a problem with your entry. Please check the address and try again.',
    5: 'There was a problem with your entry. Please check the address and try again.',
    6: 'Too many subscribe attempts for this email address. Please try again in about 5 minutes.',
    7: 'You\'re already subscribed. Thank you!'
  }
};

/**
  * AJAX MailChimp Form Contructor
  *
  * @param {HTMLElement | jQuery} form - Form element
  * @param {Object} options
  * @param {Function} options.onInit
  * @param {Function} options.onDestroy
  * @param {Function} options.onBeforeSend - Prevent AJAX submission by returning false here
  * @param {Function} options.onSubmitFail
  * @param {Function} options.onSubscribeSuccess
  * @param {Function} options.onSubscribeFail
  * @return {self}
  */
export default class AJAXMailChimpForm {
  constructor(form, options) {
    this.name = 'ajaxMailChimpForm';
    this.namespace = `.${this.name}`;
    this.events = {
      SUBMIT: 'submit' + this.namespace
    };

    const defaults = {
      onInit: $.noop,
      onDestroy: $.noop,
      onBeforeSend: $.noop,
      onSubmitFail: $.noop,
      onSubscribeSuccess: $.noop,
      onSubscribeFail: $.noop
    };

    if (form.length === 0) {
      return false;
    }

    this.$form    = form instanceof $ ? form : $(form);
    this.$input   = this.$form.find('input[type="email"]');
    this.$submit  = this.$form.find('[type="submit"]');
    this.settings = $.extend({}, defaults, options);

    if (this.$input.attr('name') !== 'EMAIL') {
      console.warn(`[${this.name}] - Email input *must* have attribute [name="EMAIL"]`);
    }

    this.$form.on(this.events.SUBMIT, this.onFormSubmit.bind(this));

    this.settings.onInit();
  }

  getRegexMatch(string, stringKey) {
    const regexPatterns = regexes[stringKey];
    let matchedId;
    
    $.each(regexPatterns, (id, regexPattern) => { // eslint-disable-line
      if (string.match(regexPattern) !== null) {
        matchedId = id;
        return false;
      }
    });

    return matchedId;
  }

  getMessageForResponse(response) {
    let msg;

    if (response.result === 'success') {
      msg = responses.success;
    }
    else {
      try {
        const parts = response.msg.split(' - ', 2);
        if (parts[1] === undefined) {
          msg = response.msg;
        }
        else {
          msg = parts[1];
        }
      }
      catch (e) {
        msg = response.msg;
      }

      // Now that we have the relevant part of the message, lets get the actual string for it
      const regexPattern = regexes.error;
      const matchedId = this.getRegexMatch(msg, 'error');
      if (matchedId && regexPattern[matchedId] && responses.error[matchedId]) {
        return msg.replace(regexPattern[matchedId], responses.error[matchedId]);
      }
    }

    return msg;
  }

  destroy() {
    this.$form.off(this.events.SUBMIT);
    this.settings.onDestroy();
  }

  onBeforeSend() {
    if (this.settings.onBeforeSend() === false) {
      return false;
    }

    if (this.$input.val() && this.$input.val().length) {
      this.$submit.prop('disabled', true);
      return true;
    }
    
    this.$input.parents('.form-group').addClass('alert-info');

    return false;
  }

  onSubmitDone(response) {
    const rspMsg = this.getMessageForResponse(response);
    this.$submit.prop('disabled', false);
    response.result === 'success' ? this.settings.onSubscribeSuccess(rspMsg) : this.settings.onSubscribeFail(rspMsg);
  }

  onSubmitFail(response) {
    this.settings.onSubmitFail();
  }

  onFormSubmit(e) {
    e.preventDefault();

    const $form = this.$form;
    const data = {};
    const dataArray = $form.serializeArray();

    // See - https://github.com/scdoshi/jquery-ajaxchimp/blob/master/jquery.ajaxchimp.js
    $.each(dataArray, (index, item) => {
      data[item.name] = item.value;
    });

    $.ajax({
      url: $form.attr('action').replace('/post?', '/post-json?').concat('&c=?'),
      dataType: 'jsonp',
      data: data,
      beforeSend: this.onBeforeSend.bind(this)
    })
      .done((response) => {
        this.onSubmitDone(response);
      })
      .fail((response) => {
        this.onSubmitFail(response);
      });

    return false;
  }
}
