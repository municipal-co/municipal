import $ from 'jquery'; // eslint-disable-line no-unused-vars
import Swiper, { Scrollbar, Navigation, Lazy } from 'swiper';
import * as Currency from '../core/currency'
import Drawer from '../ui/drawer'
import BaseSection from './base';

const selectors = {
  looksContainer: '[data-looks-container]',
  lookDrawers: '[data-drawer]',
  lookDrawerOpen: '[data-open-look-drawer]',
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
  productCategories: '[data-category-slider]',
  categoryButton: '[data-category-button]',
  lookSlides: '[data-slide]',
};

export default class ShopTheLook extends BaseSection {
  constructor(container) {
    super(container, 'shopTheLook');

    this.$looksContainer = $(selectors.looksContainer, this.$container);
    this.$looksDrawers = $(selectors.lookDrawers, this.$container);
    this.$lookDrawerOpen = $(selectors.lookDrawerOpen, this.$container);
    this.$sizeDrawerOpen = $(selectors.sizeDrawerToggler, this.$container);
    this.$productForms = $(selectors.productForm, this.$container);
    this.$productCategories = $(selectors.productCategories, this.$container.parent());
    this.$categoryButton = $(selectors.categoryButton, this.$container.parent());
    this.$slides = $(selectors.lookSlides, this.$container);

    this.$lookDrawerOpen.on('click', this.openDrawer.bind(this));
    this.$sizeDrawerOpen.on('click', this.openSizeDrawer.bind(this));
    this.$productForms.on('change', selectors.productOption, this.updateFormState.bind(this));
    this.$categoryButton.on('click', this.updateCategory.bind(this));
    if(this.$productCategories.length > 0) {
      this.initCategorySlider();
    }

    this.initLooksSlider();
  };

  initCategorySlider() {
    const categorySliderOptions = {
      centerInsufficientSlides: true,
      slidesPerView: 'auto',
      loop: false,
      spaceBetween: 15,
      threshold: 10,
      watchOverflow: true,
      slideActiveClass: 'swiper-slide-active',
      slideToClickedSlide: true,
      slidesOffsetAfter: 30,
      slidesOffsetBefore: 30,
    }

    this.categorySlider = new Swiper(this.$productCategories.get(0), categorySliderOptions);
  }

  updateCategory(evt) {
    const $this = $(evt.target);
    const category = $(evt.target).data('category-button');
    const isSlider = typeof(this.looksSlider) !== 'undefined' && this.looksSlider.initialized;

    this.$categoryButton.removeClass('card-slider__category--active');
    $this.addClass('card-slider__category--active');
    if(isSlider) {
      this.looksSlider.destroy();
      this.$slides.removeClass('swiper-slide').hide();
    }
    this.$slides.hide();

    this.$slides.each((index, slide) => {
      if($(slide).data('category').indexOf(category) > -1) {
        $(slide).show();
        if(isSlider) {
          $(slide).addClass('swiper-slide');
        }
      }
    });

    if(isSlider) {
      this.initLooksSlider();
    }
  }

  initLooksSlider() {
    const looksSliderOptions = {
      modules: [Scrollbar, Navigation],
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

    this.looksSlider = new Swiper(this.$looksContainer.get(0), looksSliderOptions);
  }

  openDrawer(evt) {
    const $this = $(evt.currentTarget)
    const drawerData = $this.data('products-info');
    const event = new CustomEvent('drawerOpen', {detail: {
      type: 'shop-the-look',
      productsData: JSON.parse(drawerData),
    }})

    document.dispatchEvent(event);
  }

  openSizeDrawer(evt) {
    const $togglerButton = $(evt.currentTarget);
    const $currentForm = $togglerButton.parents(selectors.productForm);
    const optionDrawerData = this.buildSizeDrawerData($togglerButton, $currentForm);

    $(window).trigger($.Event('option-drawer:open', {optionDrawerData} ));
  }

  buildSizeDrawerData($togglerButton, $productForm) {
    const productData = JSON.parse($productForm.find(selectors.productData).html());
    const eventData = {};
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

    eventData.productUrl = `${productData.url}?variant=${eventData.variants[0].id}#fitGuide`;
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
