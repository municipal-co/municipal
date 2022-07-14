import $ from 'jquery';
import Handlebars from 'handlebars';
import BaseSection from './base';
import Drawer from '../ui/drawer';

const selectors = {
  drawerTemplate: '[data-drawer-template]',
  optionName: '[data-option-name]',
  drawerBody: '[data-drawer-body]',
  optionSelector: '[data-option-selector]',
  bisToggler: '[data-bis-toggler]',
};

export default class OptionDrawer extends BaseSection {
  constructor(container) {
    super(container, 'optionDrawer');

    const EVENTS = {
      OPEN: 'option-drawer:open'
    }

    this.$drawerTemplate = $(selectors.drawerTemplate, this.$container).html();
    this.$drawerBody = $(selectors.drawerBody, this.$container);
    this.$optionName = $(selectors.optionName, this.$container);
    this.template = Handlebars.compile(this.$drawerTemplate);
    this.drawer = new Drawer(this.$container);

    $(window).on(EVENTS.OPEN, this.openDrawer.bind(this));
    this.$container.on('click', selectors.bisToggler, this.openBackInStockDrawer.bind(this));
    this.$container.on('change', selectors.optionSelector, this.onSelectorChange.bind(this));
  };

  openDrawer(evt) {
    this.drawerData = evt.optionDrawerData;
    if(!this.drawerData.optionIndex) {
      console.error(`[${this.namespace}] - openDrawer(): drawerData.optionIndex is needed for this method to work`);
      return;
    }

    if(!this.drawerData.variants) {
      console.error(`[${this.namespace}] - openDrawer(): drawerData.variants is needed for this method to work`);
      return;
    }

    this.processData(this.drawerData);
    this.$optionName.text(this.drawerData.printOption);
    this.$drawerBody.html(this.template(this.drawerData));
    this.drawer.show();
  }

  processData(data) {
    data.variants.map((variant) => {
      variant.optionValue = variant[data.optionIndex];
      variant.optionDowncase = variant.optionValue.toLowerCase();
      variant.lowInventory = variant.inventory_quantity <= window.settings.lowInventoryThreshold;
      if(variant.optionValue === data.activeOption) {
        variant.selected = true;
      } else {
        variant.selected = false;
      }
      return variant;
    })
  }

  openBackInStockDrawer(evt) {
    const $this = $(evt.currentTarget);
    let currentVariant = null;

    this.drawerData.variants.forEach((variant, index) => {
      if(variant.id === $this.data('variant-id')) {
        currentVariant = variant;
      }
    })

    const productData = {
      variantId: currentVariant.id,
      productTitle: this.drawerData.productTitle,
      productOptions: [],
      image: currentVariant.featured_image.src,
    }

    for(let i = 1; i <= currentVariant.options.length; i++) {
      const optionIndex = `option${i}`
      productData.productOptions.push(
        {
          label: currentVariant.options[i-1],
          value: currentVariant[optionIndex]
        }
      )
    }

    $(document).trigger($.Event('back-in-stock:open', {productData}));
  }

  // eslint-disable-next-line consistent-return
  onSelectorChange(evt) {
    const $this = $(evt.currentTarget);
    const optionValue = $this.data('option-value');
    const variantId = $this.data('variant-id');

    if(this.drawerData.addToCart === true ){
      $(window).trigger($.Event('add_one_from_variant_id', {variantID: variantId}));
      this.drawer.hide();
      return false;
    }

    if(!this.drawerData.dataField) {
      console.error(`[${this.namespace}] - Data field is undefined, this is required to return the value of the selection for future usage`);
    } else {
      this.drawerData.dataField.val(optionValue).trigger('change');
      this.drawer.hide();
    }
  }
}
