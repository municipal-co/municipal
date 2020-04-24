import $ from 'jquery'; // eslint-disable-line no-unused-vars
import BaseSection from './base';
import NewsletterForm from '../ui/newsletterForm';

const selectors = {
  newsletterForm: '[data-newsletter-form]',
  videoPlayer: '[data-video-player]',
  formInput: '.minimal-input-box__input',
  formSubmit: '.minimal-input-box__submit'
};

export default class FooterSection extends BaseSection {
  constructor(container) {
    super(container, 'footer');

    this.$container = $(container);
    this.newsletterForm = new NewsletterForm($(selectors.newsletterForm, this.$container));

    this.background = this.$container.data('background-color');
    this.observerProperties = {
      root: null,
      threshold: 0.2
    } 

    this.IntersectionObserver = new IntersectionObserver(this.observerCallback.bind(this), this.observerProperties);
    this.IntersectionObserver.observe(this.$container.get(0));

    $(selectors.formSubmit, this.$container).on('click', this.onValidationCheck.bind(this));
  }

  observerCallback(entries, observer) {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0.2 && this.background !== '') {
        $('body').css('background-color', this.background);
      }
    })
  }

  onValidationCheck(e) {
    e.preventDefault();
  }
}
