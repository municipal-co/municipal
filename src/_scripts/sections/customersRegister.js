import BaseSection from './base';
import PasswordValidation from '../ui/passwordValidation';

export default class CustomersRegisterSection extends BaseSection {
  constructor(container) {
    super(container, 'customersRegister');

    new PasswordValidation(this.$container);
  }
}
