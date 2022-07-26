import $ from 'jquery';
import BaseSection from './base';
import Drawer from '../ui/drawer';

const selectors = {
  drawer: '[data-drawer]',
  image: '[data-image]',
  form: '[data-form]',
  input: '[data-input]',
  productName: '[data-product-name]',
  responseMessage: '[data-response-message]',
};

const classes = {
  submitted: 'submitted',
}

export default class MktSubscriptionDrawer extends BaseSection {
  constructor(container) {
    super(container, 'subscription-drawer');

    this.$drawer = $(selectors.drawer, this.$container);
    this.$form = $(selectors.form, this.$container);
    this.$input =$(selectors.input, this.$form);
    this.$image = $(selectors.image, this.$container);
    this.$productName = $(selectors.productName, this.$container);
    this.$responseMessage = $(selectors.responseMessage, this.$container);

    this.drawer = new Drawer(this.$drawer);
    this.listId = this.$form.data('list-id');
    this.successMessage = this.$form.data('success-message');
    this.errorMessage = this.$form.data('error-message');

    $(window).on('marketing-drawer:open', this.openMarketingDrawer.bind(this));
    this.$form.on('submit', this.onFormSubmit.bind(this));
  }

  openMarketingDrawer(e) {
    if(!e.drawerData) {
      console.error( `[${this.name}] - drawerData is required for this section to work correctly` );
      return;
    }

    if(!e.drawerData.productName) {
      console.error( `[${this.name}] - drawerData.productName is required for section to work correctly` );
      return;
    }

    const drawerData = e.drawerData;

    this.productName = drawerData.productName
    this.updateImage(drawerData);
    this.updateProduct(drawerData);
    this.drawer.show();
    this.$form.removeClass(classes.submitted);
  }

  updateImage(drawerData) {
    if(drawerData.image) {
      this.$image.attr('src', drawerData.image);
      this.$image.parent().show();
    } else {
      this.$image.parent().hide();
    }
  }

  updateProduct(drawerData) {
    if(this.$productName.length) {
      this.$productName.text(drawerData.productName);
    }
  }

  onFormSubmit(e) {
    e.preventDefault();

    const fieldName = `Notify - ${this.productName}`;

    const formData = {
      g: this.listId,
      $fields: `$source, email, ${fieldName}`,
      email: this.$input.val(),
      $source: 'Marketing Form Drawer'
    }

    formData[fieldName] = true;

    $.ajax({
      async: true,
      crossDomain: true,
      url: '//manage.kmail-lists.com/ajax/subscriptions/subscribe',
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'cache-control': 'no-cache',
      },
      data: formData,
    }).done((data) => {
      if(data.success === true) {
        this.$form.addClass(classes.submitted);
        this.$responseMessage.text(this.successMessage);
      } else {
        this.$form.addClass(classes.submitted);
        this.$responseMessage.text(this.errorMessage);

        setTimeout(() => {
          this.$bisForm.removeClass(classes.submitted);
        }, 5000);
      }
    })
  }

  onSelect(e) {
    this.drawer.show()
  }

  onDeselect(e) {
    this.drawer.hide();
  }
}
