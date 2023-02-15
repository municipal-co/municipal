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
      .find(selectors.passwordValidate, selectors.passwordField)
      .on('blur', this.passwordValidation.bind(this));

    this.$element
      .find(selectors.resetPasswordForm)
      .submit(this.submitFunction.bind(this));

    this.$element
      .find(selectors.createCustomerForm)
      .submit(this.submitFunction.bind(this));
  }

  passwordValidation(e) {
    const form = $(e.target).parents('form');
    const passwordField = form.find(selectors.passwordField)
    const passwordValidateField = form.find(selectors.passwordValidate);
    const passwordValue = passwordField.val();
    const passwordValidateValue = passwordValidateField.val();

    if (passwordValue) {
      const passwordRegex = /^(?=.*[\w])(?=.*[!@#$%^&*\-\.])[\w!@#$%^&*\-\.]{6,}$/;

      if (passwordValue.match(passwordRegex)) {
        $(selectors.formErrorMessage).text('');
        $(selectors.formErrorMessage).removeClass('show');
        passwordField.removeClass('has-error');

        if (passwordValue === passwordValidateValue) {
          enableCreateCustomerSubmit = true;
          passwordField.removeClass('has-error')
          passwordValidateField.removeClass('has-error')
        } else {
          $(selectors.formErrorMessage).text('The passwords do not match.');
          $(selectors.formErrorMessage).addClass('show');
          enableCreateCustomerSubmit = false;
          passwordField.addClass('has-error')
          passwordValidateField.addClass('has-error')
        }
      } else {
        enableCreateCustomerSubmit = false;
        $(selectors.formErrorMessage).text(
          'Password must be at least 6 characters with 1 symbol.'
        );
        $(selectors.formErrorMessage).addClass('show');
        passwordField.addClass('has-error')
      }
    }
  }

  submitFunction(e) {
    if (!enableCreateCustomerSubmit) {
      e.preventDefault();
    }
  }
}
