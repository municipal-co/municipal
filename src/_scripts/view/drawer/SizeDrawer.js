import React, {useEffect, useRef, useState} from "preact/compat";
import Close from "../icons/Close";
import Checkmark from "../icons/Checkmark";

export default function SizeDrawer({data, index}) {
  const drawer = useRef();
  const closeDrawer = () => {
    drawer.current.classList.remove('is-visible');

    if (index == 0) {
      document.dispatchEvent(new CustomEvent('closeLastDrawer'));
    }

    drawer.current.addEventListener('transitionend', (evt) => {
      if(evt.target !== drawer.current) return false;
      const event = new CustomEvent('drawerClose', {detail:{origin: 'sizeDrawer'}});
      document.dispatchEvent(event);
    });
  };

  const closeDrawerOnIndex = (evt) => {
    const eventIndex = evt.detail.drawerIndex;
    if (index === eventIndex) {
      closeDrawer();
    }
  };

  const handleChange = (evt) => {
    const currentVariant = data.variants.find((variant) => {
      return variant[data.optionIndex] === evt.target.value;
    })

    if(data.dataField) {
      data.dataField.value = evt.target.value;
      data.dataField.dispatchEvent(new Event('input', { bubbles: true }));
      data.dataField.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if(data.addToCart && currentVariant) {
      window.dispatchEvent(
        new CustomEvent('add_one_from_variant_id', {
          detail: {
            variantID: currentVariant.id,
          },
        })
      );
    }

    closeDrawer();
  }

  const getSizeValues = () => {
    const optionIndex = data.optionsWithValues ? data.optionIndex.replace('option', '') - 1 : data.optionIndex;
    let sizeValues = [];

    if(data.optionsWithValues) {
      sizeValues = data.optionsWithValues[optionIndex].values;
    } else {
      sizeValues = data.variants;
    }

    return sizeValues;
  }

  const buildOptionSelectors = () => {
    let sizeValues = getSizeValues();
    const useVariants = typeof data.optionsWithValues === 'undefined';

    const optionSelectors = sizeValues.map((option, index) => {
      let variant;
      if(useVariants == false) {
        variant = data.variants.find(variant => {
          return variant[data.optionIndex] == option;
        });
      } else {
        variant = option;
      }

      const lowInventory = variant ? variant.inventory_quantity <= window.settings.lowInventoryThreshold : false;
      const enableBis = variant ? !variant.available && variant.metafields.enable_bis == 1 : false;

      return (
        <label className="product-option__single-selector" key={`option-${index}`}>
          <input
            type="radio"
            name={data.optionIndex}
            value={typeof variant !== 'undefined' ? variant[data.optionIndex] : option}
            data-variant-id={variant?.id || ""}
            data-final-sale-message={window.settings.finalSaleMessage}
            className="hide"
            defaultChecked={(typeof variant !== 'undefined' && data.activeOption) ? variant[data.optionIndex] === data.activeOption : false}
            disabled={!variant || !variant?.available}
            onChange={handleChange}
          />
          <div className="product-option__ui" data-option-ui>
            <div className="product-option__ui-group-corner">
              <div className="product-option__ui-checkmark">
                <Checkmark />
              </div>
              <div className="product-option__ui-label">
                {variant ? variant[data.optionIndex].replace('.00', '') : option.replace('.00', '') }
              </div>
            </div>
            <div className="product-option__ui-group-middle">
              <div className="product-option__ui-availability">
                {variant && variant.available ? 'Available' : 'Sold Out'}
              </div>
            </div>
            <div className="product-option__ui-group-corner">
              <div className="product-option__ui-quantity">
                {lowInventory && (
                  <div
                    className="product-option__ui-low-quantity"
                    data-low-quantity
                  >
                    Hurry, only {variant.inventory_quantity} left{' '}
                  </div>
                )}

                {enableBis && (
                  <div className="product-option__ui-bis-button">
                    <button
                      type="button"
                      name="bis-button"
                      className="btn-small btn-link btn-back-in-stock"
                      onClick={() => openBisDrawer(variant)}
                    >
                      Notify Me
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </label>
      );
    })
    return optionSelectors;
  }

  const openBisDrawer = (variant) => {
    document.dispatchEvent(new CustomEvent('drawerOpen', {
      detail: {
        type: 'bis-drawer',
        productTitle: data.productTitle,
        variant: variant,
      },
    }));
  }

  const submitCloseEvent = (evt) => {
    if(evt.target !== drawer.current) return false;

    const event = new CustomEvent('drawerClose', {detail:{origin: 'sizeDrawer'}});
    document.dispatchEvent(event);
    drawer.current.removeEventListener('transitionend', submitCloseEvent);
  }

  useEffect(() => {
    drawer.current.classList.add('is-visible');
    document.addEventListener('closeDrawerOnIndex', closeDrawerOnIndex);
    return () => {
      document.removeEventListener('closeDrawerOnIndex', closeDrawerOnIndex);
    };
  }, []);

  return (
    <div
      className="drawer product-option__drawer"
      ref={drawer}
      key={`drawer-${index}`}
    >
      <div className="drawer__inner product-option__drawer-inner">
        <div className="drawer__header">
          <div className="drawer__header-title">
            Select
            <span data-option-name> {data.printOption}</span>
          </div>

          <a className="drawer__close" onClick={closeDrawer}>
            <Close />
            <div className="sr-only">
              Close
              <span data-option-name></span>
              drawer
            </div>
          </a>
        </div>
        <div className="drawer__body-contents" data-drawer-body>
          <div>
            {buildOptionSelectors()}
            {data.fitTipsContent && (
              <div className="blink-box blink-box--dark">
                {data.fitTipsTitle && (
                  <h6 className="blink-box__title">{data.fitTipsTitle}</h6>
                )}
                <div
                  className="blink-box__content"
                  dangerouslySetInnerHTML={{ __html: data.fitTipsContent }}
                ></div>
              </div>
            )}
            {data.showSizing && (
              <div className="btn-container text-center" style="margin-top: 10px;">
                <a
                  href={`${data.productUrl}`}
                  className="btn-link product__size-guide-button p4"
                >
                  {' '}
                  Need help with sizing?{' '}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}