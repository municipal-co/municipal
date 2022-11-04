import $ from 'jquery'; // eslint-disable-line no-unused-vars
import Swiper from 'swiper';
import * as Currency from '../core/currency'
import Drawer from '../ui/drawer'
import BaseSection from './base';

const selectors = {
  looksContainer: '[data-looks-container]',
  lookDrawers: '[data-drawer]',
  lookDrawerOpen: '[data-look-drawer-open]',
  lookDrawerSlider: '[data-product-slider]',
  sizeDrawerToggler: '[data-size-drawer-toggler]',
  productForm: '[data-product-form]',
  formProductId: '[data-product-id]',
  productData: '[data-product-json]',
  productOption: '[data-product-option]',
  productPrice: '[data-product-price]',
  productId: '[data-product-id]',
  addToCartButton: '[data-add-to-cart-button]',
  finalSaleField: '[data-final-sale-message]',
};

export default class ShopTheLook extends BaseSection {
  constructor(container) {
    super(container, 'shopTheLook');

    this.drawerList = [];

    this.$looksContainer = $(selectors.looksContainer, this.$container);
    this.$looksDrawers = $(selectors.lookDrawers, this.$container);
    this.$lookDrawerOpen = $(selectors.lookDrawerOpen, this.$container);
    this.$sizeDrawerOpen = $(selectors.sizeDrawerToggler, this.$container);
    this.$productForms = $(selectors.productForm, this.$container);

    this.$lookDrawerOpen.on('click', this.openDrawer.bind(this));
    this.$sizeDrawerOpen.on('click', this.openSizeDrawer.bind(this));
    this.$productForms.on('change', selectors.productOption, this.updateFormState.bind(this));

    this.initLooksSlider();
    this.initLooksDrawers();
    this.initDrawerSlider();
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
      scrollbar: {
        el: '.swiper-scrollbar',
        draggable: true,
      },
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

  initLooksDrawers() {
    this.$looksDrawers.each((i, drawer) => {
      const $this = $(drawer);
      const id = $this.data('drawer-id');

      const drawerObject = new Drawer($this);

      this.drawerList.push({
        drawerObject,
        id
      })
    })
  }

  openDrawer(evt) {
    const $this = $(evt.currentTarget)
    const drawerId = $this.data('look-drawer-open');

    const drawer = this.getDrawerById(drawerId);

    drawer.show();
  }

  getDrawerById(id) {
    let currentDrawer = null;

    this.drawerList.forEach(drawer => {
      if(drawer.id === id) {
        currentDrawer = drawer.drawerObject;
      }
    });

    return currentDrawer;
  }

  initDrawerSlider() {
    this.drawerList.forEach((drawer, i) => {
      const slider = drawer.drawerObject.$el.find(selectors.lookDrawerSlider);
      const swiperSlider = new Swiper(slider, {
        initialSlide: 1,
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
          checkInView: true,
        },
      })
      this.drawerList[i].slider = swiperSlider;
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

    if(currentVariant.metafields.enable_final_sale === true) {
      $form.find(selectors.finalSaleField).attr('name', 'properties[Final Sale]');
    } else {
      $form.find(selectors.finalSaleField).removeAttr('name');
    }

    if(currentVariant !== '') {
      $form.find(selectors.addToCartButton).prop('disabled', false);
    }
  }
}
