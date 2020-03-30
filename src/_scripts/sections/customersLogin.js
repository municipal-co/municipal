import $ from 'jquery';
import BaseSection from './base';

const selectors = {
  recoverPasswordForm: '#RecoverPassword',
  hideRecoverPasswordLink: '#HideRecoverPasswordLink'
};

export default class CustomersLoginSection extends BaseSection {
  constructor(container) {
    super(container, 'customersLogin');

    // Allow deep linking to recover password form
    if (window.location.hash === '#recover') {
      this.toggleRecoverPasswordForm();
    }

    const $formState = $('.reset-password-success');

    // check if reset password form was successfully submited.
    if ($formState.length) {
      // show success message
      $('#ResetSuccess').removeClass('hide');
    }

    this.$container.on('click', selectors.recoverPasswordForm, this.onShowHidePasswordForm.bind(this));
    this.$container.on('click', selectors.hideRecoverPasswordLink, this.onShowHidePasswordForm.bind(this));
  }

  toggleRecoverPasswordForm() {
    $('#RecoverPasswordForm').toggleClass('hide');
    $('#CustomerLoginForm').toggleClass('hide');
    $('#RecoverPassword').toggleClass('hide');
  }

  onShowHidePasswordForm(e) {
    e.preventDefault();
    this.toggleRecoverPasswordForm();
  }
}
