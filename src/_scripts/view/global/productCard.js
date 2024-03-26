import React, { useEffect, useRef, useState } from "react";
import { Swiper, Scrollbar, Navigation } from "swiper";
import Image from "./image";
import * as Currency from '../../core/currency';

const ProductCard = ((props) => {
  const { product, variantId, textColor } = props;
  const card = useRef();
  const swatchSlider = useRef();
  const moneyFormat = window.theme.moneyFormat;
  const colorOption = product.options_with_values.find(option => {
    return option.name === 'Color' || option.name === 'color' || option.name === 'Colour' || option.name === 'colour';
  })

  const sizeOption = product.options_with_values.find(option => {
    return option.name === 'Size' || option.name === 'size';
  })

  product.variants = product.variants.map((variant) => {
    if(variant.compare_at_price && variant.compare_at_price > variant.price) {
      variant.discount = ((variant.compare_at_price - variant.price) / variant.compare_at_price) * 100;
    }

    return variant;
  })

  const getCurrentVariant = (variantId) => {
    let selectedVariant = {};

    if(variantId) {
      selectedVariant = product.variants.find(variant => variant.id === variantId);
    } else {
      selectedVariant = product.variants.find(variant => {
      return variant.available
      });
    }

    if (!selectedVariant) {
      selectedVariant = product.variants[0];
    }

    return selectedVariant;
  }

  const getColorList = () => {
    const productVariants = [];
    const printedColors = [];

    product.variants.forEach(function(variant) {
      const productColor = variant[`option${colorOption.position}`];
      if (
        !printedColors.find((printedColor) => printedColor === productColor) &&
        typeof variant.featured_image.src !== 'undefined' &&
        (variant.available || variant.metafields.enable_bis === 1 || variant.metafields.enable_sold_out === 1)
      ) {
        printedColors.push(productColor);
        productVariants.push(variant);
      }});

    return productVariants;
  };

  const updateCurrentVariant = (e) => {
    const newVariant = product.variants.find(loopVariant => {
      return loopVariant[`option${colorOption.position}`] === e.target.value
    });

    setCurrentVariant(newVariant);
  }

  const getCurrentColorVariant = () => {
    const currentColor = currentVariant[`option${colorOption.position}`];
    const currentColorVariants = product.variants.filter((variant) => {
      return variant[`option${colorOption.position}`] === currentColor;
    })

    return currentColorVariants;
  }

  const buildSizeDrawerData = () => {
    const drawerData = {
      optionIndex: `option${sizeOption.position}`,
      printOption: 'Size',
      productTitle: product.title,
      productId: product.id,
      addToCart: true,
      variants: getCurrentColorVariant(),
      tags: product.tags,
    }

    return drawerData;
  }

  const triggerSizeSelector = () => {
    const data = buildSizeDrawerData();
    document.dispatchEvent(new CustomEvent('drawerOpen', {
      detail: {
        type: 'option-drawer',
        ...data
      }
    }))
  }

  const getBadgeThreshold = (variant) => {
    let badgeClass = 'discount-badge--first-threshold';

    if(!variant) {
      if(currentVariant.discount >= 70) {
        badgeClass = 'discount-badge--third-threshold';
      } else if (currentVariant.discount >= 50) {
        badgeClass = 'discount-badge--second-threshold';
      }
    } else {
      if(variant.discount >= 70) {
        badgeClass = 'discount-badge--third-threshold';
      } else if (variant.discount >= 50) {
        badgeClass = 'discount-badge--second-threshold';
      }
    }

    return badgeClass;
  }

  const [currentVariant, setCurrentVariant] = useState(getCurrentVariant(variantId));

  const productColors = getColorList();
  const currentColorIndex = productColors.findIndex((variant) => {
    return variant[`option${colorOption.position}`] === currentVariant[`option${colorOption.position}`]
  });
  useEffect(() => {
    new Swiper( swatchSlider.current ,
      {
        modules: [Navigation, Scrollbar],
        slidesPerView: 4.5,
        spaceBetween: 10,
        threshold: 10,
        nested: true,
        watchOverflow: true,
        centerInsufficientSlides: true,
        initialSlide: currentColorIndex,
        watchOverflow: true,
        scrollbar: {
          el: '.swiper-scrollbar',
          draggable: true,
        },
        navigation: {
          enabled: true,
          prevEl: '.product-option__arrow-prev',
          nextEl: '.product-option__arrow-next',
        }
      })
  }, [])

  return (
    currentVariant && (
      <div className="product-card" ref={card}>
        <a
          href={`${product.url}?&variant=${currentVariant.id}`}
          className="product-card__gallery"
        >
          <div
            className={`product-card__gallery-slide is-active ${
              currentVariant.discount && 'enable-badge'
            }`}
          >
            {currentVariant.discount && (
              <div className={`discount-badge ${getBadgeThreshold()}`}>
                {currentVariant.discount}%<br /> OFF
              </div>
            )}
            <Image
              src={currentVariant.featured_image.src}
              alt={currentVariant.featured_image.alt}
              loading="lazy"
              className="product-card__image"
              sizes="480px"
            />
          </div>
        </a>
        <form action="/cart/add" className="product-card__content text-center">
          <a
            href={`${product.url}?&variant=${currentVariant.id}`}
            className="product-card__url"
          ></a>
          <div className="product-option">
            <div className="product-option__swatch swiper" ref={swatchSlider}>
              <div className="swiper-wrapper">
                {productColors.map((variant) => {
                  return (
                    <label
                      key={variant.id}
                      className="product-option__single-selector swiper-slide"
                    >
                      <input
                        type="radio"
                        name="color"
                        style={{ display: 'none' }}
                        value={variant[`option${colorOption.position}`]}
                        data-index={`option${colorOption.position}`}
                        defaultChecked={
                          variant[`option${colorOption.position}`] ===
                          currentVariant[`option${colorOption.position}`]
                        }
                        onChange={updateCurrentVariant}
                      />
                      <div className="product-option__ui">
                        {variant.discount && (
                          <div
                            className={`product-option__discount-badge ${getBadgeThreshold(
                              variant
                            )}`}
                          ></div>
                        )}

                        <Image
                          src={variant?.featured_image?.src}
                          alt={variant?.featured_image?.alt}
                          loading="lazy"
                          sizes="94px"
                        />
                      </div>
                    </label>
                  );
                })}
              </div>
              <div className="product-option__arrows">
                <div className="product-option__arrow product-option__arrow-prev"></div>
                <div className="product-option__arrow product-option__arrow-next"></div>
              </div>
              <div className="swiper-scrollbar product-option__scrollbar"></div>
            </div>
          </div>
          <div className="product-card__color-title">
            {currentVariant[`option${colorOption.position}`]}
          </div>
          <h4 class="product-card__title">{product.title}</h4>
          <div className="product-card__price-container">
            {currentVariant.compare_at_price > currentVariant.price && (
              <s className="product-card__compare-price">
                {Currency.formatMoney(currentVariant.compare_at_price, moneyFormat).replace(
                  '.00',
                  ''
                )}
              </s>
            )}
            <span className="product-price">
              {Currency.formatMoney(currentVariant.price, moneyFormat).replace('.00', '')}
            </span>
          </div>
        </form>
        <div className="product-card__add-to-cart-container">
          <button
            class="product-card__add-to-cart btn-link"
            style={{
              color: textColor == 'dark' ? '#000' : '#fff',
              borderColor: textColor == 'dark' ? '#000' : '#fff',
            }}
            onClick={triggerSizeSelector}
          >
            Add it now
          </button>
        </div>
      </div>
    )
  );
})

export default ProductCard;
