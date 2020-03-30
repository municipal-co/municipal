import $ from 'jquery';
import BaseCustomersSection from './baseCustomers';
import { postLink } from '../core/utils';

const selectors = {
  header: '[data-header]',
  newAddressForm: '[data-address-new-form]',
  editAddressForm: '[data-address-edit-form]',
  mainAddressContent: '[data-address-main-content]',
  addressNewToggle: '[data-address-new-toggle]',
  addressEditToggle: '[data-address-edit-toggle][data-form-id]',
  addressDelete: '[data-address-delete][data-form-id]'
};

const classes = {
  hide: 'hide'
};

const hashes = {
  new: '#new',
  editPrefix: '#edit-'
};

export default class CustomersAddressesSection extends BaseCustomersSection {
  constructor(container) {
    super(container, 'customersAddresses');

    this.$newAddressForm = $(selectors.newAddressForm, this.$container);
    this.$editAddressForms = $(selectors.editAddressForm, this.$container);
    this.$mainAddressContent = $(selectors.mainAddressContent, this.$container);

    let focusEl;

    if (window.location.hash === hashes.new) {
      this.$newAddressForm.removeClass(classes.hide);
      this.$mainAddressContent.addClass(classes.hide);
      focusEl = this.$newAddressForm;
    }
    else if (window.location.hash && window.location.hash.indexOf(hashes.editPrefix) > -1) {
      const id = window.location.hash.replace(hashes.editPrefix, '');
      const $editForm = $('#EditAddress_' + id);

      if ($editForm.length) {
        $editForm.removeClass(classes.hide);
        this.$mainAddressContent.addClass(classes.hide);
        focusEl = $editForm;
      }
    }

    this.scrollTo(focusEl);

    this.$container.on('click', selectors.addressNewToggle, (e) => {
      e.preventDefault();

      let scrollToEl;

      this.$editAddressForms.addClass(classes.hide);

      if (this.$newAddressForm.hasClass(classes.hide)) {
        this.$newAddressForm.removeClass(classes.hide);
        this.$mainAddressContent.addClass(classes.hide);
        scrollToEl = this.$newAddressForm;
        window.location.hash = hashes.new;
      }
      else {
        this.$newAddressForm.addClass(classes.hide);
        this.$mainAddressContent.removeClass(classes.hide);
        scrollToEl = this.$mainAddressContent;
        window.location.hash = '';
      }

      this.scrollTo(scrollToEl);
    });

    this.$container.on('click', selectors.addressEditToggle, (e) => {
      e.preventDefault();

      const id = $(e.currentTarget).data('form-id');
      const $editForm = $('#EditAddress_' + id);
      let scrollToEl;

      this.$newAddressForm.addClass(classes.hide);

      if ($editForm.hasClass(classes.hide)) {
        $editForm.removeClass(classes.hide);
        this.$mainAddressContent.addClass(classes.hide);
        scrollToEl = $editForm;
        window.location.hash = hashes.editPrefix + id;
      }
      else {
        $editForm.addClass(classes.hide);
        this.$mainAddressContent.removeClass(classes.hide);
        scrollToEl = this.$mainAddressContent;
        window.location.hash = '';
      }

      this.scrollTo(scrollToEl);
    });

    this.$container.on('click', selectors.addressDelete, function(e) {
      e.preventDefault();
      const $el = $(this);
      const formId = $el.data('form-id');
      const confirmMessage = $el.data('confirm-message');
      if (window.confirm(confirmMessage || 'Are you sure you wish to delete this address?')) {
        postLink('/account/addresses/' + formId, { parameters: { _method: 'delete' } });
      }
    });
  }

  scrollTo(el) {
    if (!el || el.length === 0) return;

    const elTop = $(el).offset().top;
    const headerHeight = $(selectors.header).outerHeight();

    // if elTop is in view, don't worry about scrolling to the element
    if (elTop > ($(window).scrollTop() + headerHeight)) {
      return;
    }

    const scrollTop = elTop - headerHeight - 50; // Add some spacing to the top of the scrollto
    $('html, body').animate({ scrollTop });
  }
}
