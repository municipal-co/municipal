import $ from 'jquery';

const selectors = {
  passwordField: '[data-password-field]',
  passwordValidate: '[data-password-validate]',
  createCustomerForm: '#create_customer',
  formErrorMessage: '[data-password-validation-error-message]'
};

let enableCreateCustomerSubmit = true;

export default class PasswordValidation {
  constructor($element) {
    this.$element = $element;

    this.$element
      .find(selectors.passwordField)
      .on('keyup', this.checkPasswordRegex.bind(this));

    this.$element
      .find(selectors.passwordValidate, selectors.passwordField)
      .on('keyup', this.checkPasswordsMatch.bind(this));

    this.$element
      .find(selectors.createCustomerForm)
      .submit(this.submitFunction.bind(this));
  }

  checkPasswordRegex(e) {
    const passwordValue = $(selectors.passwordField).val();

    if (passwordValue) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{6,}$/;

      if (passwordValue.match(passwordRegex)) {
        enableCreateCustomerSubmit = true;
        $(selectors.formErrorMessage).text('');
        $(selectors.formErrorMessage).removeClass('show');
      } else {
        enableCreateCustomerSubmit = false;
        $(selectors.formErrorMessage).text(
          "The password doesn't fullfil the conditions."
        );
        $(selectors.formErrorMessage).addClass('show');
      }
    }
  }

  checkPasswordsMatch(e) {
    const form = $(e.target).parents('form');
    const passwordField = form.find(selectors.passwordField);
    const passwordValidate = form.find(selectors.passwordValidate);

    if (passwordField.val() == passwordValidate.val()) {
      enableCreateCustomerSubmit = true;
    } else {
      enableCreateCustomerSubmit = false;
    }
  }

  submitFunction(e) {
    if (!enableCreateCustomerSubmit) {
      e.preventDefault();
      $(selectors.formErrorMessage).text("The passwords doesn't match.");
      $(selectors.formErrorMessage).addClass('show');
    }
  }
}
