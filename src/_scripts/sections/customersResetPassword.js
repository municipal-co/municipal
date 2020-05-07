import BaseSection from './base';
import PasswordValidation from '../ui/passwordValidation';

export default class CustomersResetPasswordSection extends BaseSection {
  constructor(container) {
    super(container, 'customersResetPassword');

    new PasswordValidation(this.$container);
  }
}
