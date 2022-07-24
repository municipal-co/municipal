import $ from 'jquery';
import BaseSection from './base';
import Drawer from '../ui/drawer';

const selectors = {
  accountMenuToggleButton: '[data-account-menu-drawer-toggler]',
  accountMenuDrawer: '[data-account-menu-drawer]'
};

export default class BaseCustomersSection extends BaseSection {
  constructor(container, name) {
    super(container, name);

    $(selectors.accountMenuToggleButton).on('click', this.toggleAccountMenuModal.bind(this));
    if ($(selectors.accountMenuDrawer)) {
      this.accountMenuDrawer = new Drawer($(selectors.accountMenuDrawer));
    }
  }

  toggleAccountMenuModal() {
    $('body').addClass('drawer-open');
    this.accountMenuDrawer.show();
  }
}
