import $ from 'jquery';

const selectors = {
  passwordField: '[data-password-field]',
  passwordValidate: '[data-password-validate]',
  createCustomerForm: '#create_customer',
  resetPasswordForm: '#reset-password',
  formErrorMessage: '[data-password-validation-error-message]'
};

let enableCreateCustomerSubmit = true;

export default class PasswordValidation {
  constructor($element) {
    this.$element = $element;

    this.$element
      .find(selectors.passwordValidate, selectors.passwordField)
      .on('keyup', this.passwordValidation.bind(this));

    this.$element
      .find(selectors.resetPasswordForm)
      .submit(this.submitFunction.bind(this));

    this.$element
      .find(selectors.createCustomerForm)
      .submit(this.submitFunction.bind(this));
  }

  passwordValidation(e) {
    const form = $(e.target).parents('form');
    const passwordValue = form.find(selectors.passwordField).val();
    const passwordValidateValue = form.find(selectors.passwordValidate).val();

    if (passwordValue) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[!@#$%^&*\-\.])[\w!@#$%^&*\-\.]{6,}$/;

      if (passwordValue.match(passwordRegex)) {
        $(selectors.formErrorMessage).text('');
        $(selectors.formErrorMessage).removeClass('show');

        if (passwordValue === passwordValidateValue) {
          enableCreateCustomerSubmit = true;
        } else {
          $(selectors.formErrorMessage).text('The passwords do not match.');
          $(selectors.formErrorMessage).addClass('show');
          enableCreateCustomerSubmit = false;
        }
      } else {
        enableCreateCustomerSubmit = false;
        $(selectors.formErrorMessage).text(
          'The password does not fullfil the conditions.'
        );
        $(selectors.formErrorMessage).addClass('show');
      }
    }
  }

  submitFunction(e) {
    if (!enableCreateCustomerSubmit) {
      e.preventDefault();
    }
  }
}
