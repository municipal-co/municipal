import $ from 'jquery';
import BaseCustomersSection from './baseCustomers';

const selectors = {
  accountSection: '[data-account-section]',
  togglePassword: '[data-toggle-password]'
};

const hashes = {
  passwordRecover: '#recover'
};

export default class CustomersAccountSection extends BaseCustomersSection {
  constructor(container) {
    super(container, 'customersAccount');

    this.$sections = $(selectors.accountSection, this.$container);

    this.$account = this.$sections.filter('[data-account-section="account"]');
    this.$passwordRecover = this.$sections.filter('[data-account-section="password-recover"]');

    // Allow deep linking to order history
    if (window.location.hash === hashes.passwordRecover) {
      this.switchToPasswordRecover();
    }

    this.$container.on('click', selectors.togglePassword, this.onTogglePasswordClick.bind(this));
  }

  onTogglePasswordClick(e) {
    e.preventDefault();

    if (this.$passwordRecover.hasClass('hide')) {
      this.switchToPasswordRecover();
    }
    else {
      this.switchToAccount();
    }
  }

  switchToPasswordRecover() {
    this.$account.addClass('hide');
    this.$passwordRecover.removeClass('hide');
    window.location.hash = hashes.passwordRecover;
  }

  switchToAccount() {
    this.$account.removeClass('hide');
    this.$passwordRecover.addClass('hide');
    window.location.hash = '';
  }
}
