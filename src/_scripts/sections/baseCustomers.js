import $ from 'jquery';
import BaseSection from './base';

const selectors = {
  sidebar: '[data-account-sidebar]'
};

export default class BaseCustomersSection extends BaseSection {
  constructor(container, name) {
    super(container, name);

    this.$sideBarSelect = $(selectors.sidebar).find('select');

    this.$sideBarSelect.on('change', this.onSidebarSelectChange.bind(this));
  }

  onSidebarSelectChange(e) {
    const value = $(e.currentTarget).val();
    const link = document.createElement('a');
    
    link.href = value;

    // If it's linking to a hash on the same page, don't do anything
    if (link.host === window.location.host && link.pathname === window.location.pathname) {
      return;
    }

    window.location = value;
  }
}
