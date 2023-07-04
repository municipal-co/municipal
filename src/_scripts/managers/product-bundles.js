import $ from 'jquery';
import Swiper, {Scrollbar, Navigation} from 'swiper';
import * as Image from '../core/image'
import * as Utils from '../core/utils';
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
  finalSaleMessage: '[data-final-sale-message]',
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
    this.$sizeDrawerInput.each((index, el) => {
      el.addEventListener('change', this.updateActiveSelection.bind(this));
    })

    this.initProductSwatchSliders();
  }

  initProductSwatchSliders() {
    this.$bundleProducts.each((i, product) => {
      const $productContainer = $(product);

      const $swatchSlider = $(selectors.swatchSlider, $productContainer);
      const $slides = $('.swiper-slide', $swatchSlider);
      const currentSlide = $('[data-product-option]:checked', $swatchSlider).parent().index();

      const swatchSlider = new Swiper($swatchSlider.get(0), {
        modules: [Scrollbar, Navigation],
        slidesPerView: 4.4,
        watchOverflow: true,
        slidesOffsetBefore: 15,
        slidesOffsetAfter: 15,
        spaceBetween: 8,
        initialSlide: currentSlide,
        threshold: 10,
        scrollbar: $slides.length <= 4 ? false :{
          el: '.swiper-scrollbar',
          draggable: true,
          snapOnRelease: false,
        },
        navigation: {
          prevEl: '[data-arrow-prev]',
          nextEl: '[data-arrow-next]'
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
    const optionValues = [];
    let optionImage;

    for(let i = 1; i <= 3; i++) {
      const option = `option${i}`;

      let singleOptionSelector = $(`${selectors.mainProductOptionsContainer} [data-product-option=${option}]`);
      if(singleOptionSelector.is('input[type=radio]')) {
        singleOptionSelector = singleOptionSelector.filter(':checked');
      }

      const optionValue = singleOptionSelector.val();
      if(optionValue) {
        optionValues.push(optionValue);
      }
    }

    this.$bundleProducts.not(':visible').each((index, productContainer) => {
      optionValues.forEach((value, i) => {
        const singleOptionSelector = $(`[data-product-option=option${i + 1}]`, productContainer);
        if(singleOptionSelector.is('input[type=radio]')) {
          const filteredOption = singleOptionSelector.filter(`[value="${value}"]`)
          filteredOption.prop('checked',true);
          if(filteredOption.data('option-name') == 'color' || filteredOption.data('option-name') == 'Color') {
            optionImage = filteredOption.siblings('.product-option__ui').find('img').attr('data-src');
          }

        } else {
          singleOptionSelector.val(value);
        }

        if(optionImage) {
          const $productContainer = $(productContainer);
          $productContainer.find(selectors.bundleProductImage)
          .attr('src', optionImage)
          .attr('srcset', Utils.srcSetGenerator(optionImage));

          $productContainer.find(selectors.bundleProductId).val(evt.variant.id);
          $productContainer.find(selectors.productFullPrice).attr('data-item-full-price', evt.variant.price).text(Currency.formatMoney(evt.variant.price, theme.moneyFormat).replace('.00', ''));
        }

        singleOptionSelector.trigger('change');
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
          $product.show();
        } else {
          $product.hide();
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
      dataField: $inputField.get(0),
      optionsWithValues: this.productSingleObject.options_with_values,
      showSizing: true,
      productUrl: 'javascript:void(0);',
    }

    const currentOptions = this.getActiveOptions($productContainer, optionDrawerData.optionIndex);
    const currentVariants = this.productSingleObject.variants.filter((variant) => {
      let appearances = 0;
      currentOptions.forEach((option) => {
        if(variant.option1 === option.value || variant.option2 === option.value || variant.option3 === option.value) {
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
    document.dispatchEvent(
      new CustomEvent('drawerOpen', {
        detail: {
          type: 'option-drawer',
          ...optionDrawerData,
        },
      })
    );
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
        currentOptions.push({
          selector: currentOption,
          value: currentOption.val()
        });
      } else if(skipCurrentIndex === false && currentOption.length) {
        currentOptions.push({
          selector: currentOption,
          value: currentOption.val()
        });
      }
    }

    return currentOptions;
  }

  getCurrentVariant(optionsList) {
    const clearOptions = optionsList.map(option => {
      return option.value
    })
    const variantTitle = clearOptions.join(' / ');
    let currentVariant = this.productSingleObject.variants.find((variant) => {
      return variant.title == variantTitle
    });

    console.log(currentVariant);
    console.log(optionsList);
    return currentVariant;
  }

  onProductSelectedChange(evt) {
    const $this = $(evt.currentTarget);
    const activeOptions = this.getActiveOptions($this);
    const variant = this.getCurrentVariant(activeOptions);
    let optionImage;

    if(variant) {
      $this.find(selectors.productFullPrice).text(Currency.formatMoney(variant.price, theme.moneyFormat).replace('.00', '')).attr('data-item-full-price', variant.price);

      if(variant.metafields.enable_final_sale === true) {
        $this.find(selectors.finalSaleMessage).attr('name', 'properties[Final Sale]');
      } else {
        $this.find(selectors.finalSaleMessage).removeAttr('name');
      }

      if(variant.compare_at_price > variant.price) {
        $this.find(selectors.proudctComparePrice).text(Currency.formatMoney(variant.compare_at_price, theme.moneyFormat).replace('.00', ''));
      } else {
        $this.find(selectors.proudctComparePrice).text('');
      }

      if(variant.available) {
        $this.find(selectors.productSoldOutMessage).hide();
        $this.find(selectors.productPriceContainer).show();
      } else if(variant.metafields.enable_sold_out === 1) {
        $this.find(selectors.productSoldOutMessage).text(theme.strings.soldOut).show();
        $this.find(selectors.productPriceContainer).hide();
      } else {
        $this.find(selectors.productSoldOutMessage).text(theme.strings.soldOut).show();
        $this.find(selectors.productPriceContainer).hide();
      }

      if(variant.metafields.enable_final_sale === true) {
        $this.find(selectors.finalSaleMessage).attr('name', 'properties[Final Sale]');
      } else {
        $this.find(selectors.finalSaleMessage).removeAttr('name');
      }
    } else {
      $this.find(selectors.productSoldOutMessage).text(theme.strings.soldOut).show();
      $this.find(selectors.productPriceContainer).hide();
    }

    $this.find(selectors.bundleProductId).val(variant?.id || "");

    for(let i = 0; i < activeOptions.length; i++) {
      if(activeOptions[i].selector.is('[data-option-name="color"]')) {
        optionImage = activeOptions[i].selector.siblings('.product-option__ui').find('img').attr('src');
      }
      $(`[data-option-${i+1}]`, $this).text(activeOptions[i].value);
    }

    if(optionImage){
      $this.find(selectors.bundleProductImage)
      .attr('src', Image.getSizedImageUrl(optionImage, '82x'))
      .attr('alt', optionImage)
      .attr('srcset', Utils.srcSetGenerator(optionImage));
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
          if($(selectors.productSoldOutMessage, $(product)).text() === theme.strings.soldOut) {
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
        $(selectors.productAddToCartText).text(theme.strings.soldOut);
        $(selectors.addToCartPrice).hide();
      }else if (soldOut){
        $(selectors.productAddToCart).prop('disabled', true);
        $(selectors.productAddToCartText).text(theme.strings.soldOut);
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
            $(selectors.productAddToCartText).text(theme.strings.soldOut);
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
