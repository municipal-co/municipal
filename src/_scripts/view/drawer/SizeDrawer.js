import React, {useEffect, useRef, useState} from "preact/compat";
import Close from "../icons/Close";
import Checkmark from "../icons/Checkmark";

export default function SizeDrawer({data, index}) {
  const [ defaultUnit, setDefaultUnit ] = useState(true);
  const [ showBISMessage, setShowBISMessage ] = useState(false);
  const globalSettings = JSON.parse(document.querySelector('[data-size-drawer-settings]').innerHTML);
  const drawer = useRef();
  const { optionsDivider, optionsHeaders } = window.theme.SizeSelector;
  const enableSizeSelector = data?.tags?.find((tag) => {
    return tag.toLowerCase() == 'footwear';
  });

  const getUnitIndex = () => {
    let unitIndex = 1;
    if(defaultUnit == true) {
      if(sizeUnit == 'eu') {
        unitIndex = 3;
      } else if (data.tags && data.tags.find((tag) => tag === 'gender:Womens') ||
                 document.referrer.indexOf('women') > -1 ||
                 document.location.search.indexOf('unit=women') > -1) {
        unitIndex = 2;
      }
    } else {
      unitIndex = parseInt(localStorage.getItem('unitIndex'));
    }

    return unitIndex;
  }

  const updateUnitIndex = (evt) => {
    const $this = evt.target;
    const sizeUnit = $this.dataset.sizeUnit;
    const unitIndex = $this.value;

    setUnitIndex(unitIndex);
    localStorage.setItem('unitIndex', unitIndex);
    setSizeUnit(sizeUnit);
    localStorage.setItem('sizeUnit', sizeUnit);
    const updateEvent = new CustomEvent('sizeOption:changeUnit');
    document.dispatchEvent(updateEvent);
  }

  const buildSizeSelector = () => {
    let options = optionsHeaders.split(optionsDivider);
    options = options.map((option, index) => {
      const fixedIndex = index+1;
      return <label className="drawer__size-selector-option-container">
        <input type="radio" name="indexSelector" onChange={updateUnitIndex}  value={fixedIndex}  defaultChecked={ fixedIndex == unitIndex } data-size-unit={option.toLowerCase() == 'eu' ? 'EU' : 'USA'} style={{"display": "none"}}/>
        <span className="drawer__size-selector-option">{ option }</span>
      </label>
    })
    return (
      <div className="drawer__size-selector-wrapper">
        <div className="drawer__size-selector">
          { options }
        </div>
        <div className="drawer__size-selector-disclaimer">
          <span>Make sure to select your size within the correct column above</span>
        </div>
      </div>
    );
  }

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
      data.dataField.classList.add('edited');
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
    let hasAvailableVariants = false;
    const optionSelectors = sizeValues.map((option, index) => {
      let variant;
      if(useVariants == false) {
        variant = data.variants.find(variant => {
          return variant[data.optionIndex] == option;
        });
      } else {
        variant = option;
      }
      let optionName = variant ? variant[data.optionIndex]?.replace('.00', '') : option?.replace('.00', '');
      if(variant && variant.available) {
        hasAvailableVariants = true;
      }
      if(variant && !variant.available && variant.metafields.enable_bis == 1) {
        setShowBISMessage(true);
      }

      if(enableSizeSelector) {
        const optionNamePieces = optionName.split(optionsDivider);
        if(typeof optionNamePieces[unitIndex - 1] !== 'undefined') {
          optionName = optionNamePieces[unitIndex - 1].trim();
        }
      }

      const lowInventory = variant ? variant.inventory_quantity <= window.settings.lowInventoryThreshold : false;
      const enableBis = variant ? !(variant.available || variant.availability) && variant.metafields.enable_bis == 1 : false;

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
            disabled={!variant || (!variant?.available && !variant.availability)}
            onChange={handleChange}
          />
          <div className="product-option__ui" data-option-ui>
            <div className="product-option__ui-group-corner">
              <div className="product-option__ui-checkmark">
                <Checkmark />
              </div>
              <div className="product-option__ui-label">
                { optionName }
              </div>
            </div>
            <div className="product-option__ui-group-middle">
              <div className="product-option__ui-availability">
                {variant && (variant.available || variant.availability) ? 'Available' : 'Sold Out'}
              </div>
            </div>
            <div className="product-option__ui-group-corner">
              <div className="product-option__ui-quantity">
                {variant?.inventory_management === "shopify" && lowInventory && (
                  <div
                    className="product-option__ui-low-quantity"
                    data-low-quantity
                  >
                    {variant.inventory_quantity} left
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

    if(hasAvailableVariants) {
      setShowBISMessage(false);
    }
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

  const [ sizeUnit, setSizeUnit ] = useState(window.theme.SizeSelector.sizeUnit);
  const [ unitIndex, setUnitIndex ] = useState(getUnitIndex());

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
            {enableSizeSelector && buildSizeSelector()}
            {showBISMessage && globalSettings?.notifyText !== null && (
              <div className="drawer__bis-noity-text"> {globalSettings.notifyText} </div>
            )}
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
                  data-fit-guide-toggler
                > Need help with sizing? </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}