import $ from 'jquery';
import Swiper from 'swiper';
import * as Image from '../core/image'
import * as Currency from '../core/currency';

const selectors = {
  mainProductOptionsContainer: '[data-product-detail-options]',
  bundleOption: '[data-bundle-option]',
  bundleProduct: '[data-bundle-product]',
  bundleProductsContainer: '[data-bundle-products]',
  bundleProductId: '[data-bundle-product-id]',
  bundleProductImage: '[data-bundle-product-image]',
  productDrawer: '[data-product-drawer]',
  productPriceContainer: '[data-price-container]',
  proudctComparePrice: '[data-item-compare-price]',
  productFullPrice: '[data-item-full-price]',
  productSoldOutMessage: '[data-sold-out]',
  bundleEditToggle: '[data-bundle-edit-toggle]',
  addToCartPrice: '[data-add-to-cart-price]',
  productAddToCart: '[data-add-to-cart]',
  productAddToCartText: '[data-add-to-cart-text]',
  sizeDrawerToggler: '[data-size-drawer-toggler]',
  sizeDrawerInput: '[data-size-drawer-input]',
  productOption: '[data-product-option]',
  bundleSavings: '[data-bundle-savings]',
  swatchSlider: '[data-swatch-slider]',
}

const classes = {
  open: 'is-open',
  active: 'is-active',
}

export default class ProductBundles {
  constructor($container, productSingleObject) {
    this.name = 'productBundlesManager';
    this.namespace = `.${this.name}`;
    this.$container = $container;
    this.productSingleObject = productSingleObject;

    this.$bundleOptions = $(selectors.bundleOption, this.$container);
    this.$bundleProductsContainer = $(selectors.bundleProductsContainer, this.$container);
    this.$bundleProducts = $(selectors.bundleProduct, this.$container);
    this.$bundleEditToggle = $(selectors.bundleEditToggle);
    this.$sizeDrawerToggler = $(selectors.sizeDrawerToggler, this.$bundleProducts);
    this.$sizeDrawerInput = $(selectors.sizeDrawerInput, this.$bundleProducts);
    this.productSliders = [];

    this.$bundleOptions.on('change', this.onBundleOptionChange.bind(this));
    this.$bundleEditToggle.on('click', this.toggleBundleDrawer.bind(this));
    this.$container.on('variantChange', this.updateVariant.bind(this));
    this.$bundleProducts.on('change', this.onProductSelectedChange.bind(this));
    this.$sizeDrawerToggler.on('click', this.openCustomSizeDrawer.bind(this));
    this.$sizeDrawerInput.on('change', this.updateActiveSelection.bind(this));

    this.initProductSwatchSliders();
  }

  initProductSwatchSliders() {
    this.$bundleProducts.each((i, product) => {
      const $productContainer = $(product);

      const $swatchSlider = $(selectors.swatchSlider, $productContainer);
      const currentSlide = $('[data-product-option]:checked', $swatchSlider).parent().index();

      const swatchSlider = new Swiper($swatchSlider.get(0), {
        slideClass: 'swiper-slide',
        slidesPerView: 4.4,
        watchOverflow: true,
        slidesOffsetBefore: 15,
        slidesOffsetAfter: 15,
        spaceBetween: 8,
        initialSlide: currentSlide,
        threshold: 10,
        navigation: {
          prevEl: '[data-arrow-prev]',
          nextEl: '[data-arrow-next]'
        },
        breakpoints: {
          1024: {
            slidesPerGroup: 4,
          }
        }
      });


      this.productSliders.push({
        product: $productContainer,
        slider: swatchSlider
      })
    })
  }

  getSliderFromContainer($productContainer) {
    let slider;

    this.productSliders.forEach((productSlider) => {
      if(productSlider.product.get(0) === $productContainer.get(0)) {
        slider = productSlider.slider;
      }
    })

    return slider;
  }

  updateVariant(evt) {
    this.$bundleProducts.not(':visible').each((index, productContainer) => {
      const $productContainer = $(productContainer);
      $productContainer.find(selectors.bundleProductImage).attr('src', evt.variant.featured_image.src);
      $productContainer.find(selectors.bundleProductImage).attr('data-src', evt.variant.featured_image.src);
      $productContainer.find(selectors.bundleProductId).val(evt.variant.id);
      $productContainer.find(selectors.productFullPrice).attr('data-item-full-price', evt.variant.price).text(Currency.formatMoney(evt.variant.price, theme.moneyFormat).replace('.00', ''));

      if(evt.variant.available) {
        $productContainer.find(selectors.productPriceContainer).show();
        $productContainer.find(selectors.productSoldOutMessage).hide();
      } else {
        $productContainer.find(selectors.productPriceContainer).hide();
        $productContainer.find(selectors.productSoldOutMessage).show();
      }

      if(evt.variant.compare_at_price > evt.variant.price) {
        $productContainer.find(selectors.proudctComparePrice)
          .attr('data-item-compare-price', evt.variant.compare_at_price)
          .text(Currency.formatMoney(evt.variant.compare_at_price, theme.moneyFormat)
          .replace('.00', ''));
      } else {
        $productContainer.find(selectors.proudctComparePrice).attr('data-item-compare-price', '').text('');
      }
      [1, 2, 3].forEach((i) => {
        const optionIndex = `option${i}`;
        if(evt.variant[optionIndex]) {
          const optionLowercase = evt.variant[optionIndex].toLowerCase();
          const optionValueContainer = `[data-option-${i}]`;

          $productContainer.find(optionValueContainer).text(evt.variant[optionIndex]);
          $productContainer.find(`[data-option-value="${optionLowercase}"]`).prop('checked', true);
          $productContainer.find(`input[type=hidden][data-product-option=${optionIndex}]`).val(evt.variant[optionIndex]).trigger('change');
        }
      })
    })
  }

  onBundleOptionChange(evt) {
    const $this = $(evt.currentTarget);
    const selectedQty = $this.val();

    if(selectedQty > 1) {
      this.$bundleProductsContainer.show();
      this.$bundleProducts.each((index, product) => {
        const $product = $(product);
        if(index + 1 <= selectedQty) {
          $(product).show();
        } else {
          $(product).hide();
        }
      })
    } else {
      this.$bundleProductsContainer.hide();
      this.$bundleProducts.hide()
    }

    this.updateATCstate();
  }

  toggleBundleDrawer(evt) {
    const $this = $(evt.currentTarget);
    const $container = $this.parents(selectors.bundleProduct);
    const $drawer = $container.find(selectors.productDrawer);

    const slider = this.getSliderFromContainer($container);

    if($container.hasClass(classes.open)) {
      $container.removeClass(classes.open);
      $drawer.css('height', 0);
    } else {
      const drawerHeight = $container.find(selectors.productDrawer).get(0).scrollHeight;

      $container.addClass(classes.open);
      $drawer.css('height', drawerHeight);

      setTimeout(() => {
        slider.update();
      }, 150)
    }

  }

  updateKlarnaPrice($container) {

    if(typeof $container === 'undefined') {
      this.$bundleOptions.each((index, el) => {
        if($(el).is(':checked')) {
          $container = $(el).parent();
        }
      })
    }

    let klarnaPrice = 0;
    const $klarnaMessaging = $(selectors.klarnaMessagingPrice, this.$container);
    const $bundleDiscountPrice = $(selectors.bundleDiscountPrice, $container);
    const $bundleFullPrice = $(selectors.bundleFullPrice, $container);
    if($bundleDiscountPrice.length) {
      klarnaPrice = $bundleDiscountPrice.data('bundle-discount-price');
    } else {
      klarnaPrice = $bundleFullPrice.data('bundle-full-price');
    }

    if($klarnaMessaging.length > 0) {
      $klarnaMessaging.attr('data-purchase-amount', klarnaPrice);
      window.KlarnaOnsiteService = window.KlarnaOnsiteService || [];
      window.KlarnaOnsiteService.push({eventName: 'refresh-placements'});
    }
    setTimeout(() => {
    }, 50);
  }

  checkProductsAvailabilty() {
    const activeProducts = this.$bundleProducts.filter((index, el) => {
      if($(el).parent().is(':visible')) {
        return el;
      }
    })
    activeProducts.each((index, el) => {
      if($(selectors.bundleProductSoldout, $(el).parent()).is(':visible')) {
        $(selectors.productAddToCart).prop('disabled', true).text(theme.strings.soldOut);
      }
    })
  }

  openCustomSizeDrawer(evt) {
    const $this = $(evt.currentTarget);
    const $productContainer = $this.parents(selectors.bundleProduct);
    const $inputField = $this.siblings(selectors.productOption);

    // Gather the data
    const optionDrawerData = {
      printOption: $inputField.data('print-option'),
      optionIndex: $inputField.data('index'),
      productTitle: $inputField.data('product-title'),
      activeOption: $inputField.attr('data-option-value'),
      dataField: $inputField,
    }

    const currentOptions = this.getActiveOptions($productContainer, optionDrawerData.optionIndex);

    const currentVariants = this.productSingleObject.variants.filter((variant) => {
      let appearances = 0;
      currentOptions.forEach((option) => {
        if(variant.option1 === option || variant.option2 === option || variant.option3 === option) {
          appearances++;
        }
      })
      if(appearances !== currentOptions.length) {
        return false;
      }
      return variant;
    })

    optionDrawerData.variants = currentVariants;

    $(window).trigger($.Event('option-drawer:open', {optionDrawerData} ));
  }

  getActiveOptions($productContainer, currentIndex) {
    const currentOptions = [];
    let skipCurrentIndex = false;

    if(typeof currentIndex !== 'undefined') {
      skipCurrentIndex = true;
    }

    for (let i = 1; i <= 3; i++) {
      const optionIndex = 'option' + i;
      const currentOption = $(`[data-product-option=${optionIndex}]`, $productContainer).filter((index, el) => {
        const $el = $(el);
        if(($el.is('[type=radio]') && $el.is(':checked')) || (!$el.is('[type=radio]') && $el.val() !== '')) {
          return true;
        }
      });

      if(skipCurrentIndex === true && optionIndex !== currentIndex && currentOption.length) {
        currentOptions.push(currentOption.val());
      } else if(skipCurrentIndex === false && currentOption.length) {
        currentOptions.push(currentOption.val());
      }
    }

    return currentOptions;
  }

  getCurrentVariant(optionsList) {
    const variantTitle = optionsList.join(' / ');
    let currentVariant;

    for(let i = 0; i < this.productSingleObject.variants.length; i++) {
      if(this.productSingleObject.variants[i].title === variantTitle) {
        currentVariant = this.productSingleObject.variants[i];
        break;
      }
    }

    return currentVariant;
  }

  onProductSelectedChange(evt) {
    const $this = $(evt.currentTarget);
    const activeOptions = this.getActiveOptions($this);
    const variant = this.getCurrentVariant(activeOptions);

    for(let i = 0; i < activeOptions.length; i++) {
      $(`[data-option-${i+1}]`, $this).text(activeOptions[i]);
    }

    $this.find(selectors.bundleProductImage)
    .attr('src', Image.getSizedImageUrl(variant.featured_image.src, '82x'))
    .attr('alt', variant.featured_image.alt);

    $this.find(selectors.bundleProductId).val(variant.id);

    $this.find(selectors.productFullPrice).text(Currency.formatMoney(variant.price, theme.moneyFormat).replace('.00', '')).attr('data-item-full-price', variant.price);

    if(variant.compare_at_price > variant.price) {
      $this.find(selectors.proudctComparePrice).text(Currency.formatMoney(variant.compare_at_price, theme.moneyFormat));
    } else {
      $this.find(selectors.proudctComparePrice).text('');
    }

    if(variant.available) {
      $this.find(selectors.productSoldOutMessage).hide();
      $this.find(selectors.productPriceContainer).show();
    } else if(variant.metafields.enable_sold_out === 1) {
      $this.find(selectors.productSoldOutMessage).text('Sold Out').show();
      $this.find(selectors.productPriceContainer).hide();
    } else {
      $this.find(selectors.productSoldOutMessage).text('Unavailable').show();
      $this.find(selectors.productPriceContainer).hide();
    }
    if($this.is(':visible')) {
      this.updateATCstate();
    }
  }

  updateActiveSelection(evt) {
    const $this = $(evt.currentTarget);
    const $sizeButtonToggler = $this.siblings(selectors.sizeDrawerToggler).find('[data-button-text]');

    $this.attr('data-option-value', $this.val());
    $this.attr('value', $this.val());

    $sizeButtonToggler.html(`Selected Size: <span class="product-option__drawer-btn-value">${$this.val()}</span>`);
    $sizeButtonToggler.parent().addClass(classes.active);
  }

  updateATCstate() {
    const $visibleProducts = this.$bundleProducts.filter(':visible');
    let totalPrice = 0;
    let finalPrice = 0;
    const discountPercentage = $(`${selectors.bundleOption}:checked`).data('discount-value');

    if($visibleProducts.length > 0) {
      let soldOut = false;
      let unavailable = false;
      $visibleProducts.each((i, product) => {
        totalPrice += Number.parseInt($(selectors.productFullPrice, product).attr('data-item-full-price'));
        if( $(selectors.productSoldOutMessage, $(product)).is(':visible') ) {
          if($(selectors.productSoldOutMessage, $(product)).text() === 'Unavailable') {
            unavailable = true;
          } else {
            soldOut = true;
          }
        }
      })

      const savingAmount = totalPrice * discountPercentage / 100;
      finalPrice = totalPrice - savingAmount;

      $(selectors.bundleSavings).text(`You Saved ${Currency.formatMoney(savingAmount, theme.moneyFormat).replace('.00', '')}`).show();
      $(selectors.addToCartPrice).text(Currency.formatMoney(finalPrice, theme.moneyFormat).replace('.00', ''));

      if(unavailable) {
        $(selectors.productAddToCart).prop('disabled', true);
        $(selectors.productAddToCartText).text('Unavailable');
        $(selectors.addToCartPrice).hide();
      }else if (soldOut){
        $(selectors.productAddToCart).prop('disabled', true);
        $(selectors.productAddToCartText).text('Sold Out');
        $(selectors.addToCartPrice).show();
      } else {
        $(selectors.productAddToCart).prop('disabled', false);
        $(selectors.productAddToCartText).text('Add to Bag');
        $(selectors.addToCartPrice).show();
      }
    } else {
      finalPrice = this.$bundleProducts.eq(0).find(selectors.productFullPrice).data('item-full-price');
      const productOptions = this.getActiveOptions($(selectors.mainProductOptionsContainer));
      $(selectors.bundleSavings).hide();
      $(selectors.addToCartPrice).text(Currency.formatMoney(finalPrice, theme.moneyFormat).replace('.00', ''));
      if(productOptions.length > 1) {
        const currentId = $('[data-product-select] option:selected').val();
        const currentVariant = this.productSingleObject.variants.filter((variant) => {
          return variant.id === Number.parseInt(currentId);
        })

        if(currentVariant.length) {
          if(currentVariant[0].available) {
            $(selectors.productAddToCart).prop('disabled', false);
            $(selectors.productAddToCartText).text('Add to Bag');
          } else if(currentVariant[0].metafields.enable_sold_out === 1) {
            $(selectors.productAddToCartText).text('Sold Out');
          } else {
            $(selectors.productAddToCartText).text('Unavailable');
            $(selectors.productAddToCart).prop('disabled', true);
            $(selectors.addToCartPrice).hide();
          }
        }
      } else {
        $(selectors.productAddToCart).prop('disabled', true);
        $(selectors.productAddToCartText).text('Add to Bag');
        $(selectors.addToCartPrice).show();
      }
    }

    $('[data-purchase-amount]').attr('data-purchase-amount', finalPrice);
    window.KlarnaOnsiteService = window.KlarnaOnsiteService || [];
    window.KlarnaOnsiteService.push({eventName: 'refresh-placements'});
  }
}
