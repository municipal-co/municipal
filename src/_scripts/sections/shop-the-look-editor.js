import $ from 'jquery'; // eslint-disable-line no-unused-vars
import Swiper from 'swiper';
import * as Currency from '../core/currency'
import Drawer from '../ui/drawer'
import BaseSection from './base';

const selectors = {
  looksContainer: '[data-looks-container]',
  lookDrawer: '[data-drawer]',
  lookDrawerOpen: '[data-look-drawer-open]',
  lookDrawerContent: '[data-body-content]',
  lookDrawerSlider: '[data-product-slider]',
  sizeDrawerToggler: '[data-size-drawer-toggler]',
  productForm: '[data-product-form]',
  formProductId: '[data-product-id]',
  productData: '[data-product-json]',
  productOption: '[data-product-option]',
  productPrice: '[data-product-price]',
  productId: '[data-product-id]',
  addToCartButton: '[data-add-to-cart-button]',
  modalContent: '[data-modal-content]',
};

export default class ShopTheLookEditor extends BaseSection {
  constructor(container) {
    super(container, 'shopTheLookEditor');
    this.$drawer = $(selectors.lookDrawer, this.$container);
    console.log(this.$container);
    this.$looksContainer = $(selectors.looksContainer, this.$container);
    this.$looksDrawers = $(selectors.lookDrawers, this.$container);
    this.$bodyContent = $(selectors.lookDrawerContent, this.$container);
    this.$lookDrawerOpen = $(selectors.lookDrawerOpen, this.$container);
    this.drawer = new Drawer(this.$drawer);

    this.$lookDrawerOpen.on('click', this.openDrawer.bind(this));
    this.$container.on('click', selectors.sizeDrawerToggler, this.openSizeDrawer.bind(this));
    this.$container.on('change', selectors.productOption, this.updateFormState.bind(this));

    this.initLooksSlider();
  };

  initLooksSlider() {
    const looksSliderOptions = {
      slidesPerView: 1.15,
      loop: false,
      spaceBetween: 15,
      slidesOffsetBefore: 30,
      slidesOffsetAfter: 30,
      threshold: 10,
      watchOverflow: true,
      navigation: {
        nextEl: '[data-arrow-next]',
        prevEl: '[data-arrow-prev]'
      }
    }

    if(this.$container.attr('id') !== 'shop-the-look-pdp') {
      looksSliderOptions.slidesPerView = 1.3;
      looksSliderOptions.spaceBetween = 20;
      looksSliderOptions.slidesOffsetBefore = 30;
      looksSliderOptions.slidesOffsetAfter = 30;
      looksSliderOptions.breakpoints = {
        530: {
          slidesPerView: 2.3
        },
        992: {
          slidesPerView: 3.3,
          slidesOffsetAfter: 50,
          slidesOffsetBefore: 50,
        },
        1400: {
          slidesPerView: 4.3,
          slidesOffsetAfter: 50,
          slidesOffsetBefore: 50,
        }
      }
    }

    this.looksSlider = new Swiper(this.$looksContainer, looksSliderOptions);
  }

  openDrawer(evt) {
    const $this = $(evt.currentTarget);

    const modalContent = $this.find(selectors.modalContent).get(0).content.cloneNode(true)
    this.$bodyContent.html(modalContent);
    this.initDrawerSlider();

    this.drawer.show();
  }

  initDrawerSlider() {
    const slider = this.$drawer.find(selectors.lookDrawerSlider);
    new Swiper(slider, {
      centeredSlides: true,
      loop: false,
      slidesPerView: 1.5,
      spaceBetween: 15,
      threshold: 20,
      navigation: {
        prevEl: '[data-arrow-prev]',
        nextEl: '[data-arrow-next]'
      },
      lazy: {
        enabled: true,
        loadPrevNextAmount: 3,
      },
    })
  }

  openSizeDrawer(evt) {
    const $togglerButton = $(evt.currentTarget);
    const $currentForm = $togglerButton.parents(selectors.productForm);
    const optionDrawerData = this.buildSizeDrawerData($togglerButton, $currentForm);

    $(window).trigger($.Event('option-drawer:open', {optionDrawerData} ));
  }

  buildSizeDrawerData($togglerButton, $productForm) {
    const eventData = {};
    const productData = JSON.parse($productForm.find(selectors.productData).html());
    eventData.showSizing = productData.metafields.enable_fit_guide;
    eventData.fitTipsTitle = productData.metafields.fit_tips_title;
    eventData.fitTipsContent = productData.metafields.fit_tips_content;
    const currentColor = $togglerButton.data('current-color');
    const colorIndex = $togglerButton.data('color-index');
    const printOption = $togglerButton.data('print-option');
    const printOptionKey = $togglerButton.data('print-option-key');


    eventData.variants = productData.variants.filter((variant, index) => {
      return variant[colorIndex] === currentColor;
    })

    productData.options.forEach((option, index) => {
      if(option.toLowerCase() === printOption.toLowerCase()) {
        eventData.optionIndex = `option${index + 1}`;
      }
    })

    eventData.productTitle = productData.title;
    eventData.printOption = printOption;

    $productForm.find(selectors.productOption).each((index, option) => {
      const $this = $(option);
      if($this.data('product-option') === printOptionKey) {
        eventData.dataField = $this;
        eventData.activeOption = $this.val();
      }
    });

    return eventData;
  }

  updateFormState(evt) {
    const $field = $(evt.target);
    const $form = $field.parents('form');
    const productData = JSON.parse($form.find('[data-product-json]').html());
    const fieldOptionIndex = $field.data('product-option');
    const currentOptions = [];

    let currentVariant = '';

    $form.find('[data-option-text]').each((index, option) => {
      const $option = $(option);
      if($option.data('option-text') === fieldOptionIndex) {
        const fieldValue = $field.val() === 'OS' ? 'One Size' : $field.val();
        $option.html(`Selected ${$option.data('print-option')}: <span class="product-option__drawer-btn-value">${fieldValue}</span>`);
        $option.parent().addClass('is-active');
      }
    })

    $form.find('[data-product-option]').each((index, option) => {
      const $option = $(option);

      currentOptions.push($option.val());
    })

    productData.variants.forEach((variant) => {
      if(variant.title === currentOptions.join(' / ')) {
        currentVariant = variant;
      }
    })

    $form.find(selectors.productId).val(currentVariant.id);
    $form.find(selectors.variantPrice).text(Currency.formatMoney(currentVariant.price, window.moneyFormat).replace('.00', ''));

    if(currentVariant != '') {
      $form.find(selectors.addToCartButton).prop('disabled', false);
    }
  }
}