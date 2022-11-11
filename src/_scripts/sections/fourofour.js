import BaseSection from './base';

const selectors = {
  form: '[data-search-form]',
  searchInput: '[data-search-input]',
};

export default class FourOFour extends BaseSection {
  constructor(container) {
    super(container, 'fourofour');

    this.$form = document.querySelector(selectors.form);
    this.formTarget = this.$form.action;
    this.$searchInput = this.$form.querySelector(selectors.searchInput);

    this.$form.addEventListener('submit', this.onFormSubmit.bind(this));
  };

  onFormSubmit(evt) {
    evt.preventDefault();

    const inputValue = this.$searchInput.value
    document.location.href = this.formTarget + '?q=' + inputValue;
  }
}
