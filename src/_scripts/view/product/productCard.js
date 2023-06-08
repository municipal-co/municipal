import $ from 'jquery';
import Swiper, { Scrollbar, Navigation } from 'swiper';
import * as Currency from '../../core/currency';

const selectors = {
  el: '[data-product-card]',
  gallerySlider: '[data-gallery-slider]',
  gallerySlide: '[data-gallery-slide]',
  swatchSlider: '[data-swatch-slider]',
  colorTitle: '[data-color-title]',
  singleOptionSelector: '[data-single-option-selector]',
  singleProductJson: '[data-product-json]',
  drawerField: '[data-drawer-field]',
  addToCartButton: '[data-option-drawer-trigger]',
  productPrice: '[data-product-price]',
  cardPrice: '[data-product-price]',
  cardComparePrice: '[data-compare-price]',
  productUrl: '[data-product-url]',
  discountBadge: '[data-discount-badge]',
};

const classes = {
  active: 'is-active',
  visible: 'is-visible',
};

const events = {
  openDrawer: 'option-drawer:open',
};

const $window = $(window);

export default class ProductCard {
  /**
   * Product Card constructor
   *
   * @param {HTMLElement | $} el - The card element
   */
  constructor(el) {
    this.name = 'productCard';
    this.namespace = `.${this.name}`;
    this.$container = $(el);
    this.$gallerySlider = $(selectors.gallerySlider, this.$container);
    this.$slides = $(selectors.gallerySlide, this.$container);
    this.$colorTitle = $(selectors.colorTitle, this.$container);
    this.$singleOptionSelector = $(selectors.singleOptionSelector, this.$container);
    this.$drawerField = $(selectors.drawerField, this.$container);
    this.$optionDdrawerOpen = $(selectors.addToCartButton, this.$container);
    this.$productPrice = $(selectors.cardPrice, this.$container);
    this.$comparePrice = $(selectors.cardComparePrice, this.$container);
    this.$productUrl = $(selectors.productUrl, this.$container);
    this.$discountBadge = $(selectors.discountBadge, this.$container);

    this.$singleOptionSelector.on('change', this.onOptionChange.bind(this));
    this.$optionDdrawerOpen.on('click', this.openOptionDrawer.bind(this));
    this.singleProductJson = JSON.parse($(selectors.singleProductJson, this.$container).html());

    this.setSizeDrawerData();
    this.updateProductOption();
    this.initSwatchSlider();
  }

  setSizeDrawerData() {
    this.drawerData = {
      optionIndex: this.$drawerField.data('option-index'),
      printOption: this.$drawerField.data('option-name'),
      productTitle: this.$drawerField.data('product-title'),
      addToCart: true,
      fitTipsTitle: this.singleProductJson.metafields.fit_tips_title,
      fitTipsContent: this.singleProductJson.metafields.fit_tips_content,
      showSizing: this.singleProductJson.metafields.enable_fit_guide,
    }
  }

  initSwatchSlider() {
    const $selectedColor = $(selectors.singleOptionSelector+':checked', this.$container);
    const $scrollbar = $('.swiper-scrollbar', this.$container);
    const $slides = $('[data-swatch-slide]', this.$container);
    let swatchIndex = 0
    if($selectedColor.length) {
      swatchIndex = $selectedColor.parent().index();
    }

    $slides.each((index, slide) => {
      const input = slide.querySelector('[data-single-option-selector]');
      if(input.dataset.variantComparePrice) {
        const discountValue = 100 - (input.dataset.variantPrice / input.dataset.variantComparePrice * 100);
        let badgeClass = 'discount-badge--first-threshold';

        if(discountValue >= 70) {
          badgeClass = 'discount-badge--third-threshold';
        } else if(discountValue >= 50) {
          badgeClass = 'discount-badge--second-threshold';
        }

        slide.querySelector('.product-option__discount-badge').classList.add(badgeClass);
      }
    })

    const swatchSliderSettings = {
      modules: [ Navigation, Scrollbar ],
      slidesPerView: 4.5,
      spaceBetween: 10,
      threshold: 10,
      initialSlide: swatchIndex,
      nested: true,
      watchOverflow: true,
      centerInsufficientSlides: true,
      scrollbar: {
        el: $scrollbar.get(0),
        draggable: true,
      },
      navigation: {
        enabled: true,
        prevEl: '[data-arrow-prev]',
        nextEl: '[data-arrow-next]',
      }
    }

    this.swatchSlider = new Swiper($(selectors.swatchSlider, this.$container).get(0), swatchSliderSettings);
  }

  updateBadges(variant) {
    if(variant.compare_at_price > variant.price) {
      this.$container.addClass('enable-badge');
      const discountValue = 100 - (variant.price / variant.compare_at_price * 100);
      let discountStyle = 'discount-badge--first-threshold';
      this.$discountBadge.html(`${discountValue}% <br> OFF`);
      if(discountValue >= 70) {
        discountStyle = 'discount-badge--third-threshold';
      } else if(discountValue >= 50) {
        discountStyle = 'discount-badge--second-threshold';
      }

      this.$discountBadge.addClass(discountStyle);
    } else {
      this.$container.removeClass('enable-badge');
    }
  }

  onOptionChange(evt) {
    const $this = $(evt.currentTarget);
    if($this.data('option-name') === 'color') {
      const optionIndex = $this.data('index');
      const optionValue = $this.data('value');
      this.updateColor.call(this, $this);
      this.updateProductOption.call(this, $this);
    } else if($this.data('option-name') === 'Size' || $this.data('option-name') === 'size' ) {
      this.updateSize.call(this);
    } else {
      this.updateProductOption.call(this, $this);
    }
  }

  updateColor($this) {
    const selectedColor = $this.val();

    this.$colorTitle.text(selectedColor);

    this.cardGalleryUpdate(selectedColor.toLowerCase());
  }

  cardGalleryUpdate(selectedColor) {
    this.$slides.each((i, slide) => {
      const $slide = $(slide);

      if($slide.data('image-selector') === selectedColor) {
        $slide.addClass(classes.active);
      } else {
        $slide.removeClass(classes.active);
      }
    })
  }

  updateProductOption() {
    const options = this.getSelectedOptions();

    this.drawerData.variants = this.getOptionVariants(options);
    this.drawerData.productUrl = `${this.singleProductJson.url}?variant=${this.drawerData.variants[0].id}#fitGuide`;

    this.updateCardPrice(this.drawerData.variants[0]);
    this.updateCardUrl(this.drawerData.variants[0]);
    this.updateBadges(this.drawerData.variants[0]);
  }

  getSelectedOptions() {
    const options = [];

    for(let i = 1; i <= 3; i++) {
      const optionIndex = 'option'+i;
      const optionValue = $(`[data-product-option=${optionIndex}]`, this.$container).filter((index, el) => {
        const $el = $(el);
        if(($el.is('[type=radio]') && $el.is(':checked')) || (!$el.is('[type=radio]') && $el.val() !== '')) {
          return true;
        }
      });
      if(optionValue.length) {
        options.push(optionValue.val());
      }
    }

    return options;
  }

  getOptionVariants(options) {
    const selectedVariants = this.singleProductJson.variants.filter((variant) => {
      let validCount = 0;
      options.forEach((option, index) => {
        const optionIndex = `option${index+1}`;

        if (variant[optionIndex] === option) {
          validCount++;
        }
      })

      if (validCount === options.length) {
        return true;
      }
    })

    return selectedVariants;
  }

  updateCardPrice(variant) {
    if(variant.compare_at_price > variant.price) {
      this.$comparePrice.html(Currency.formatMoney(variant.compare_at_price, theme.moneyFormat).replace('.00', ''));
      this.$comparePrice.show();
    } else {
      this.$comparePrice.html('');
      this.$comparePrice.hide();
    };

    this.$productPrice.html(Currency.formatMoney(variant.price, theme.moneyFormat).replace('.00', ''));
  }

  updateCardUrl(variant) {
    this.$productUrl.each((i, url) => {
      const currentUrl = $(url).data('product-url');
      url.href = variant.url ? variant.url : (currentUrl + `?variant=${variant.id}`);
    })
  }

  openOptionDrawer() {
    document.dispatchEvent(
      new CustomEvent('drawerOpen', {
        detail: {
          type: 'option-drawer',
          ...this.drawerData,
        },
      })
    );
  }

  updateSize() {
    const options = this.getSelectedOptions();

    const currentVariants = this.getOptionVariants(options);

    this.$drawerField.val('');

    $window.trigger($.Event('add_one_from_variant_id', {variantID: currentVariants[0].id}));
  }
}
