import $ from 'jquery'; // eslint-disable-line no-unused-vars
import BaseSection from './base';
import AJAXKlaviyoForm from '../lib/ajaxKlaviyoForm';

const selectors = {
  newsletterForm: '[data-footer-signup]',
  newsletterFormMessage: '[data-footer-signup-message]',
  newsletterControls: '[data-footer-signup-controls]',
  newsletterInput: '[data-footer-signup-input]',
};

export default class FooterSection extends BaseSection {
  constructor(container) {
    super(container, 'footer');
    this.newsletterForm = $(selectors.newsletterForm, this.$container);

    const $form = this.newsletterForm;
    const listId = $form.data('list-id');

    const options = {
      onSubscribeSuccess() {
        const successMessage = $(selectors.newsletterFormMessage, $form).data('message-success');
        $(selectors.newsletterFormMessage, $form).text(successMessage).show();
        $(selectors.newsletterControls, $form).hide();
        $(selectors.newsletterInput, $form).val('');
      },
      onSubscribeFail() {
        const successFail = $(selectors.newsletterFormMessage, $form).data('message-fail');
        $(selectors.newsletterFormMessage, $form).text(successFail).show();

        setTimeout(function(){
          $(selectors.newsletterFormMessage, $form).hide().text('');
        }, 3000);
      },
      onSubmitFail() {
        const successFail = $(selectors.newsletterFormMessage, $form).data('message-fail');
        $(selectors.newsletterFormMessage, $form).text(successFail).show();

        setTimeout(function(){
          $(selectors.newsletterFormMessage, $form).hide().text('');
        }, 3000);
      }
    };

    options.listId = listId;

    this.ajaxKlaviyoForm = new AJAXKlaviyoForm($form, options);
  };
}
