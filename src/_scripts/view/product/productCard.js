import $ from 'jquery';
import * as Currency from '../../core/currency';
import ScrollSnapSlider from '../../managers/scrollSnapSlider';

const selectors = {
  el: '[data-product-card]',
  gallerySlider: '[data-gallery-slider]',
  gallerySlide: '[data-gallery-slide]',
  swatchSlider: '[data-swatches-container]',
  colorTitle: '[data-color-title]',
  singleOptionSelector: '[data-single-option-selector]',
  singleProductJson: '[data-product-json]',
  drawerField: '[data-drawer-field]',
  addToCartButton: '[data-option-drawer-trigger]',
  productPrice: '[data-product-price]',
  cardPrice: '[data-product-price]',
  cardComparePrice: '[data-compare-price]',
  productUrl: '[data-product-url]',
};

const classes = {
  active: 'is-active',
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
    this.$swatchSlider = $(selectors.swatchSlider, this.$container);

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
    let swatchIndex = 0
    if($selectedColor.length) {
      swatchIndex = $selectedColor.parent().index();
    }

    this.swatchSlider = new ScrollSnapSlider(this.$swatchSlider.get(0), {
      enableScrollbar: true,
      enableArrows: true,
      nextArrow: '[data-arrow-next]',
      prevArrow: '[data-arrow-prev]',
      paddingBefore: '20px',
      paddingAfter: '20px',
      initialSlide: swatchIndex,
      slidesPerView: 3.8,
      breakpoints: {
        1024: {
          slidesPerView: 4.8
        }
      }
    })
  }

  onOptionChange(evt) {
    const $this = $(evt.currentTarget);

    if($this.data('option-name') === 'color') {
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
    $(document).trigger($.Event(events.openDrawer, {optionDrawerData: this.drawerData}));
  }

  updateSize() {
    const options = this.getSelectedOptions();

    const currentVariants = this.getOptionVariants(options);

    this.$drawerField.val('');

    $window.trigger($.Event('add_one_from_variant_id', {variantID: currentVariants[0].id}));
  }
}
