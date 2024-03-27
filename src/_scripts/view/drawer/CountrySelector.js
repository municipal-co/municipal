import React, { useRef, useEffect } from "react";
import Cookies from "js-cookie";
import Close from "../icons/Close"


export default function CountrySelector({countryData, index}) {
  const drawer = useRef();
  const geolocationData = JSON.parse(document.querySelector('[data-geolocation-settings]').innerHTML);
  const updateCountry = (storeUrl) => () => {
    if(!storeUrl) {
      closeDrawer()
    } else {
      document.location.href = storeUrl + "?ref=" + window.location.origin;
    }
  }

  const closeDrawer = () => {
    drawer.current.classList.remove('is-visible');

    if (index == 0) {
      document.dispatchEvent(new CustomEvent('closeLastDrawer'));
    }

    Cookies.set('country-selector__dismissed', true);

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

  useEffect(() => {
    drawer.current.classList.add('is-visible');
    document.addEventListener('closeDrawerOnIndex', closeDrawerOnIndex);
    return () => {
      document.removeEventListener('closeDrawerOnIndex', closeDrawerOnIndex);
    };
  }, []);

  return (
    <div className="drawer country-selector__container" ref={drawer}>
      <div className="drawer__inner country-selector__inner">
        <div className="drawer__header country-selector__header">
          <div className="drawer__header-title country-selector__title">Location</div>
          <button
            className="drawer__close country-selector__close"
            onClick={closeDrawer}
          >
            <Close />
            <div className="sr-only">Close drawer</div>
          </button>
        </div>
        <div className="drawer__body-contents country-selector__body">
          <div className="country-selector__text">
            We think you are in {countryData.countryName}. <br />
            Update your location?
          </div>
          <div className="country-selector__buttons-container">
            {geolocationData.countrySelectors.map((country, index) => {
              return (
                <button
                  className={`country-selector__button btn ${country.storeUrl !== '' ? 'btn-outline-primary' : 'btn-primary'}`}
                  onClick={updateCountry(country.storeUrl)}
                  key={`country-selector-${index}`}
                >
                  {country.countryName}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}