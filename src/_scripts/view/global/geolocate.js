import React, { useEffect, useRef, useState } from "preact/compat";
import Cookies from "js-cookie";

export default function Geolocation() {
  const [displayMessage, setDisplayMessage] = useState(false);
  const geolocationData = document.querySelector('[data-geolocation-settings]')?.innerHTML;
  if(!geolocationData) {
    return null;
  }
  const geolocationSettings = JSON.parse(geolocationData);
  const countryCookie = Cookies.get('country-selector__customer-country');
  const dismissedCookie = Cookies.get('country-selector__dismissed');
  const storeCountry = geolocationSettings.currentCountry;

  const fetchLocation = async () => {
    const response = await fetch('https://geolocation.it-057.workers.dev');
    const data = await response.json();

    Cookies.set('country-selector__customer-country', JSON.stringify(data));

    return data;
  }

  const customerCountryData = countryCookie ? JSON.parse(countryCookie) : fetchLocation();

  if(!dismissedCookie && customerCountryData.country !== storeCountry) {
    setDisplayMessage(true);
  }

  useEffect(() => {
    if(displayMessage == true) {
      const event = new CustomEvent('drawerOpen', {detail: {
        type: 'country-selector',
        countryData: customerCountryData,
      }})

      document.dispatchEvent(event);
    }
  }, [displayMessage]);
}