import React, { useEffect, useRef, useState } from "react";
import Swiper, {Scrollbar} from "swiper";

const productCard = ((props) => {

  const processData = () => {
    let data = props.data;

    data.variants.map(variant => {
      if(variant.color) {
        variant.color = variant.custom_fields.old_colors;
      }
      if(variant.size) {
        variant.size = typeof(variant.size) == 'string' ? variant.size : variant.size[0];
      }

      return variant;
    })

    data.variants = filterSoldOutVariants(data);

    return data;
  }

  const filterSoldOutVariants = (data) => {
    const availableColors = [];
    let filteredVariant = [];

    data.variants.forEach(variant => {
      if(variant.availability || variant.custom_fields.mf_custom_fields_enable_notify_me == '1' || variant.custom_fields.mf_custom_fields_enable_sold_out == '1') {
        if(availableColors.indexOf(variant.color) == -1) {
          availableColors.push(variant.color);
        }
      }
    })

    filteredVariant = data.variants.filter(variant => availableColors.indexOf(variant.color) > -1 )

    return filteredVariant;
  }

  const getCurrentVariant = (variantId) => {
    let selectedVariant = {};
    if(variantId) {
      selectedVariant = productData.variants.find(variant => variant.id == variantId);
    } else {
      selectedVariant = productData.variants.find(variant => variant.id == productData.selected_variant_id);
    }

    if(!selectedVariant) {
      selectedVariant = productData.variants[0];
    }
    return selectedVariant;
  }

  const getColorList = (productObject, variantOption) => {
    const colors = [];
    const colorList = [];
    productObject.variants.forEach(variant => {
      if(variant[variantOption] !== undefined) {
        if(typeof variant[variantOption] === 'string' && colorList.indexOf(variant[variantOption]) === -1) {
          colors.push(variant);
          colorList.push(variant[variantOption]);
        } else if(typeof variant[variantOption] === 'object' && colorList.indexOf(variant[variantOption][0]) === -1) {
          colors.push(variant);
          colorList.push(variant[variantOption][0]);
        }
      }
    })

    return colors;
  }

  const updateCurrentVariant = (e) => {
    const option = e.target;
    const value = option.dataset.optionValue;
    const optionIndex = option.dataset.index;
    let selectedVariant = productData.variants.find(variant => variant[optionIndex] == value);

    if(selectedVariant) {
      setCurrentVariant(selectedVariant);
    }
  }

  const buildColorSwatch = (variant) => {
    return(<label key={variant.id} className="product-option__single-selector swiper-slide">
      <input type="radio" name="color" value={ variant['color'] } style={{display: 'none'}} data-product-option='color' data-option-value={variant['color']} data-index="color" checked={variant.color == currentVariant.color} onChange={updateCurrentVariant} />
      <div className="product-option__ui">
        <img src={variant.image_url} alt="" loading="lazy"/>
      </div>
    </label>)
  }

  const getCurrentVariantIndex = () => productColors.indexOf(currentVariant);

  const initSwiper = () => {
    new Swiper(swatchSlider.current, {
      modules: [Scrollbar],
      slidesPerView: 4.5,
      spaceBetween: 10,
      threshold: 10,
      initialSlide: getCurrentVariantIndex(),
      watchOverflow: true,
      centerInsufficientSlides: true,
      scrollbar: {
        el: '.swiper-scrollbar',
        draggable: true,
      }
    })
  }

  const getCurrentColorVariant = () => {
    const colorIndex = currentVariant.color == undefined ? 'option1' : 'color';
    const sortMap = {
      'xs': 1,
      's':2,
      'm':3,
      'l': 4,
      'xl': 5,
      '2xl': 6,
      '3xl': 7,
      '4xl': 8,
      'os': 9,
    }

    const currentColorVariants = productData.variants.filter((variant) => {
      return variant[colorIndex] == currentVariant[colorIndex];
    })

    currentColorVariants.map(variant => {
      variant.id = Number.parseInt(variant.id);
      variant.featured_image = {src: variant.image_url, alt: variant.title};
      variant.inventory_quantity = variant.quantity;
      variant.available = variant.quantity > 0;
      variant.metafields = {
        enable_bis: variant.custom_fields.mf_custom_fields_enable_notify_me == '1' ? true : undefined,
      };
      variant.options = [
        'color',
        'size'
      ];
      variant.option1 = variant.color;
      variant.option2 = variant.size;
    })

    currentColorVariants.sort((variant1, variant2) => {
      const variant1Value = variant1.size || variant1.option2;
      const variant2Value = variant2.size || variant2.option2;
      if(!isNaN(variant1Value) && !isNaN(variant2Value)) {
        return parseFloat(variant1Value) - parseFloat(variant2Value);
      } else {
        return sortMap[variant1Value.toLowerCase()] - sortMap[variant2Value.toLowerCase()];
      }
    })
    return currentColorVariants;
  }

  const buildSizeDrawerData = () => {
    const drawerData = {
      optionIndex: 'size',
      printOption: 'Size',
      productTitle: productData.title,
      addToCart: true,
      variants: getCurrentColorVariant(),
    }

    return drawerData;
  }

  const openSizeSelectorDrawer = () => {
    const data = buildSizeDrawerData();
    const event = new CustomEvent('option-drawer:open')
    event.optionDrawerData = data;
    document.dispatchEvent(event);
  }

  const markCurrentCard = (e) => {
    if(document.location.href.indexOf('/collections/') > -1 || document.location.href.indexOf('/search') > -1) {
      const cardId = card.current.id;
      history.replaceState(history.state, null, document.location.pathname + document.location.search + `#${cardId}`)
    }
  }

  let productData = processData();
  productData.options = ['color', 'size'];
  const [productColors, setProductColors] = useState(getColorList(productData, 'color'));
  const [currentVariant, setCurrentVariant] = useState(getCurrentVariant())
  const swatchSlider = useRef();
  const card = useRef();

  useEffect(() => {
    if(props.scrollIntoView == true) {
      card.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      })

      history.replaceState(history.state, null, document.location.pathname + document.location.search);
    }
  }, [])

  useEffect(() => {
    initSwiper();
  }, [productColors])

  useEffect(() => {
    productData = processData();
    setProductColors(getColorList(productData, 'color'));
    setCurrentVariant(getCurrentVariant(productData.selected_variant_id));

  }, [props.data])


  return (
    currentVariant && <div id={`product-card-${props?.data?.id}`} className="product-card" ref={card}>
        <a href={currentVariant.product_url} className="product-card__gallery" onClick={markCurrentCard}>
          <div className="product-card__gallery-slide is-active">
            <img className="product-card__image" src={currentVariant.image_url} loading='lazy' />
          </div>
        </a>
        <form action="/cart/add" className="product-card__content text-center">
          <div className="product-option">
            <div className="product-option__swatch swiper" ref={swatchSlider}>
              <div className="swiper-wrapper">
                {productColors.map(color => buildColorSwatch(color))}
              </div>
              <div className="swiper-scrollbar product-option__scrollbar"></div>
            </div>
          </div>
          <div className="product-card__color-title product-card__color-title--findify">
            {currentVariant.color}
          </div>
          <div className="product-card__title">
            {currentVariant.title}
          </div>
          <div className="product-card__price-container">
            {currentVariant.compare_at && <s className="product-compare-at-price" data-compare-at-price>${currentVariant.compare_at.toFixed(2).replace('.00', '')}</s>}
            <span className="product-price" data-product-price>
              ${currentVariant.price.toFixed(2).replace('.00', '')}
            </span>
          </div>
        </form>
        <div className="product-card__add-to-cart-container">
          <button className="product-card__add-to-cart btn-link" role="button" onClick={openSizeSelectorDrawer}>
            Add It Now
          </button>
        </div>
      </div>
  );
})

export default productCard;
