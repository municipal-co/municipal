import $ from 'jquery'; // eslint-disable-line no-unused-vars
import BaseSection from './base';
import NewsletterForm from '../ui/newsletterForm';

const selectors = {
  newsletterForm: '[data-newsletter-form]'
};

export default class FooterSection extends BaseSection {
  constructor(container) {
    super(container, 'footer');

    this.newsletterForm = new NewsletterForm($(selectors.newsletterForm, this.$container));

    // Hook this newsletter form up to an ESP ajax form callbacks as follows...
    //
    // this.ajaxForm = new AJAXForm($form, {
    //   onSubscribeSuccess: this.newsletterForm.onSubscribeSuccess,
    //   onSubmitFail: this.newsletterForm.onSubmitFail
    // });
  }
}
