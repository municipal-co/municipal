import React, { useRef, useState } from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import Image from "./image";

const ProductCard = ((props) => {
  const { product, variantId } = props;
  const card = useRef();
  const swatchSlider = useRef();
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

  const buildColorSwatch = (variant) => {
    const colorOption = product.options.find(option => {
      return option.name === 'Color' || option.name === 'color';
    })

    return (
      <SwiperSlide>
        <label>
          <input
            type="radio"
            name="color"
            style={{display: 'none'}}
            value={variant[`option${colorOption.index}`]}
            data-index={`option${colorOption.index}`}
            onChange={updateCurrentVariant}
          />
          <div className="product-option__ui">
            <Image
              src={variant.featured_image.src}
              alt={variant.featured_image.alt}
              loading="lazy"
              sizes="77px"
            />
          </div>
        </label>
      </SwiperSlide>
    );
  }

  const [currentVariant, setCurrentVariant] = useState(getCurrentVariant(variantId));

  return (
    currentVariant && (
      <div className="product-card" ref={card}>
        <a href={`${product.url}?&variant=${currentVariant.id}`} className="product-card__gallery">
          <div className="product-card__gallery-slide is-active">
            <Image
              src={currentVariant.featured_image.src}
              alt={currentVariant.featured_image.alt}
              loading="lazy"
              className="product-card__image"
            />
          </div>
        </a>
        <form action="/cart/add" className="product-card__content text-center">
          <div className="product-option">
            <Swiper className="product-option__swatch" ref={swatchSlider}>
              { buildColorSwatch() }
            </Swiper>
          </div>
        </form>
      </div>
    )
  );
})

export default ProductCard;
