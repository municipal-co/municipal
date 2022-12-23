import $ from 'jquery';
import BaseSection from './base';
import Drawer from '../ui/drawer';
import PasswordValidation from '../ui/passwordValidation';

const selectors = {
  customersDrawerToggle: '[data-customers-drawer-toggle]',
  customersDrawer: '[data-customers-drawer]',
  customersRecoverPassword: '[data-recover-password]',
  customersRegisterForm: '[data-register-form]',
  hideRecoverPasswordForm: '[data-hide-recover-password-form]',
  hideRegisterForm: '[data-hide-register-form]'
};

export default class CustomersDrawerSection extends BaseSection {
  constructor(container) {
    super(container, 'customersDrawer');

    this.customersDrawer = new Drawer($(selectors.customersDrawer));

    new PasswordValidation(this.$container);

    $(selectors.customersDrawerToggle).on(
      'click',
      this.toggleCustomersDrawer.bind(this)
    );

    this.$container.on(
      'click',
      selectors.customersRecoverPassword,
      this.toggleRecoverPasswordForm.bind(this)
    );

    this.$container.on(
      'click',
      selectors.hideRecoverPasswordForm,
      this.toggleRecoverPasswordForm.bind(this)
    );

    this.$container.on(
      'click',
      selectors.customersRegisterForm,
      this.toggleRegisterForm.bind(this)
    );

    this.$container.on(
      'click',
      selectors.hideRegisterForm,
      this.toggleRegisterForm.bind(this)
    );
  }

  toggleCustomersDrawer(event) {
    event.preventDefault();
    $('body').toggleClass('drawer-open');
    this.customersDrawer.toggle();
    document.dispatchEvent(new CustomEvent('drawer:open-header-drawer'))
  }

  toggleRecoverPasswordForm(event) {
    event.preventDefault();
    this.$container.find('#CustomerLoginForm').toggleClass('hide');
    this.$container.find('#RecoverPasswordForm').toggleClass('hide');
  }

  toggleRegisterForm(event) {
    event.preventDefault();
    this.$container.find('#CustomerLoginForm').toggleClass('hide');
    this.$container.find('#CustomerRegisterForm').toggleClass('hide');
  }
}
