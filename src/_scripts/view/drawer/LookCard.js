import React, { useRef, useState } from "preact/compat";
import CaretDown from "../icons/CaretDown";
import Image from "../global/image";

export default function LookCard({product}) {
  const sizeOption = useRef();
  const colorIndex = product.options.findIndex(option => {
    return option == 'Color' || option == 'color'
  });
  const sizeIndex = product.options.findIndex(option => {
    return option == 'Size' || option == 'size'
  });
  const [currentVariant, setCurrentVariant] = useState(product.variants[0]);
  const [enableAddToCart, setEnableAddToCart] = useState(false);
  const [optionSelected, setOptionSelected] = useState(null);

  const openOptionDrawer = (evt) => {
    const $this = evt.srcElement;
    const optionIndex = $this.dataset.printOptionKey;
    const printOption = $this.dataset.printOption;

    const event = new CustomEvent('drawerOpen', { detail: {
      type: 'option-drawer',
      printOption,
      optionIndex,
      optionsWithValues: product.options_with_values,
      productUrl: product.url,
      productTitle: product.title,
      variants: product.variants,
      dataField: sizeOption.current,
      activeOption: sizeOption.current.value,
      fitTipsTitle: product.metafields.fit_tips_title,
      fitTipsContent: product.metafields.fit_tips_content,
      showSizing: product.metafields.enable_fit_guide,
    }})

    document.dispatchEvent(event);
  }

  const changeVariant = (evt) => {
    const $this = evt.target;
    const sizeValue = $this.value;
    const sizeOption = $this.name;

    const variant = product.variants.find((variant) => {
      return variant[sizeOption] === sizeValue;
    })

    setCurrentVariant(variant);
    setOptionSelected(sizeValue);
    setEnableAddToCart(true);
  }

  return (
    <div className="look-drawer__product-card" key={product.id}>
      <div className="look-drawer__product-card-image-container frame frame--1x1">
        <Image
          src={`${currentVariant.featured_image.src}`}
          alt={currentVariant.featured_image.alt}
          className="lazyload look-drawer__product-card-image frame__inner"
          sizes="(max-width=992px) 66w,374px"
        />
      </div>

      <span className="look-drawer__product-card-color">
        {currentVariant[`option${colorIndex + 1}`]}
      </span>

      <div className="look-drawer__product-card-title h6">{product.title}</div>

      <form
        className="look-drawer__product-card-form"
        action="/cart/add.js"
        data-product-form
      >
        <input
          type="hidden"
          name={`option${colorIndex + 1}`}
          value={currentVariant[`option${colorIndex + 1}`]}
        />

        <input
          type="hidden"
          name={`option${sizeIndex + 1}`}
          onChange={changeVariant}
          ref={sizeOption}
        />

        <button
          className={`btn btn-outline-primary btn-block product-option__drawer-btn ${
            optionSelected ? 'is-active' : ''
          }`}
          type="button"
          data-current-color={currentVariant[`option${colorIndex + 1}`]}
          data-color-index={`option${colorIndex + 1}`}
          data-print-option="Size"
          data-print-option-key={`option${sizeIndex + 1}`}
          onClick={openOptionDrawer}
        >
          <span
            className="button__text"
            data-option-text={`option${colorIndex + 1}`}
            data-print-option="Size"
            style={{ pointerEvents: 'none' }}
          >
            {optionSelected ? 'Selected Size: ' : 'Select Size'}
            {optionSelected && (
              <span className="product-option__drawer-btn-value">
                {optionSelected}
              </span>
            )}
          </span>

          <div className="btn__ui" style={{ pointerEvents: 'none' }}>
            <CaretDown />
          </div>
        </button>
        <button
          className="btn btn-primary btn-block"
          data-add-to-cart-button
          disabled={!enableAddToCart}
        >
          ADD TO BAG
          <span className="look-drawer__product-card-price" data-product-price>
            <span className="product-price" data-product-price>
              ${(currentVariant.price / 100).toFixed(2).replace('.00', '')}
            </span>
          </span>
        </button>
        {product.metafields.enable_final_sale && (
          <input
            type="hidden"
            value="{{settings.final_sale_message}}"
            data-final-sale-message
            name="properties[Final Sale]"
          />
        )}

        <input type="hidden" name="id" defaultValue={currentVariant.id} />

        <a
          className="look-drawer__product-card-link btn btn-link"
          href={`${product.url}?variant=${currentVariant.id}`}
          data-product-url={`${currentVariant.url}`}
        >
          View this product
        </a>
      </form>
    </div>
  );
}