import $ from 'jquery'; // eslint-disable-line no-unused-vars
import BaseSection from './base';
import AJAXKlaviyoForm from '../lib/ajaxKlaviyoForm';

const selectors = {
  newsletterForm: '[data-newsletter-form]',
  newsletterFormMessage: '.newsletter-form-message',
  newsletterInput: '.minimal-input-box__input',
  subscriptionModal: '[data-footer-subscription-modal]',
  formResultMessage: '[data-form-result-message]',
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
        $(selectors.formResultMessage).text(successMessage);

        $(selectors.subscriptionModal).modal('show');
        $(selectors.newsletterInput, $form).val('');

      },
      onSubscribeFail() {
        const successFail = $(selectors.newsletterFormMessage, $form).data('message-fail');
        $(selectors.newsletterInput, $form).val(successFail);

        setTimeout(function(){
          $(selectors.newsletterInput, $form).val('');
        }, 3000);
      },
      onSubmitFail() {
        const successFail = $(selectors.newsletterFormMessage, $form).data('message-fail');
        $(selectors.newsletterInput, $form).val(successFail);

        setTimeout(function(){
          $(selectors.newsletterInput, $form).val('');
        }, 3000);
      }
    };

    options.listId = listId;

    this.ajaxKlaviyoForm = new AJAXKlaviyoForm($form, options);
  };
}
