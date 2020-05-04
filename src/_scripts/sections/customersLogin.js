import $ from 'jquery';
import BaseSection from './base';
import PasswordValidation from '../ui/passwordValidation';

const selectors = {
  recoverPasswordForm: '#RecoverPassword',
  hideRecoverPasswordForm: '[data-hide-recover-password-form]'
};

export default class CustomersLoginSection extends BaseSection {
  constructor(container) {
    super(container, 'customersLogin');

    // Allow deep linking to recover password form
    if (window.location.hash === '#recover') {
      this.toggleRecoverPasswordForm();
    }

    const $formState = $('.reset-password-success');

    new PasswordValidation(this.$container);

    // check if reset password form was successfully submited.
    if ($formState.length) {
      // show success message
      $('#ResetSuccess').removeClass('hide');
    }

    this.$container.on(
      'click',
      selectors.recoverPasswordForm,
      this.onShowHidePasswordForm.bind(this)
    );

    this.$container.on(
      'click',
      selectors.hideRecoverPasswordForm,
      this.onShowHidePasswordForm.bind(this)
    );
  }

  toggleRecoverPasswordForm() {
    this.$container.find('#RecoverPasswordForm').toggleClass('hide');
    this.$container.find('#CustomerLoginForm').toggleClass('hide');
    this.$container.find('#RecoverPassword').toggleClass('hide');
  }

  onShowHidePasswordForm(e) {
    e.preventDefault();
    this.toggleRecoverPasswordForm();
  }
}
