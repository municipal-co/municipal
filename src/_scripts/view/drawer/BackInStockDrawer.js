import React, { useEffect, useRef, useState } from "preact/compat"
import Arrow from "../icons/Arrow";
import Close from "../icons/Close"
export default function BackInStockDrawer({data, index}) {
  const drawer = useRef();
  const form = useRef();
  const email = useRef();
  const messageContainer = useRef();
  const [responseMessage, setResponseMessage] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const drawerSettings = JSON.parse(document.querySelector('[data-bis-drawer-settings]').innerHTML);

  const getOption = (option) => {
    const optionIndex = data.variant.options.findIndex((variantOption) => {
      return variantOption.toLowerCase() == option.toLowerCase();
    })

    return data.variant[`option${optionIndex + 1}`];
  }

  const closeDrawer = () => {
    drawer.current.classList.remove('is-visible');

    if (index == 0) {
      document.dispatchEvent(new CustomEvent('closeLastDrawer'));
    } else {
      drawer.current.addEventListener('transitionend', (evt) => {
        if(evt.target !== drawer.current) return false;
        const event = new CustomEvent('drawerClose', {detail:{origin: 'sizeDrawer'}});
        document.dispatchEvent(event);
      });
    }
  };

  const closeDrawerOnIndex = (evt) => {
    const eventIndex = evt.detail.drawerIndex;
    if (index === eventIndex) {
      closeDrawer();
    }
  };

  const buildBodyInfo = () => {
    return drawerSettings.notifyText.replace('[[product]]', `<span class="bis__highlighted-text">${data.productTitle}</span>`)
    .replace('[[color]]', `<span class="bis__highlighted-text">${currentColor}</span>`)
    .replace('[[size]]', `<span class="bis__highlighted-text">${currentSize}</span>`)
  }

  const clearMessage = () => {
    setResponseMessage('');
  }

  const onFormSubmit = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    const formData = {
      a: drawerSettings.apiKey,
      email: email.current.value,
      variant: data.variant.id,
      platform: 'shopify'
    }

    const dataString = new URLSearchParams(formData).toString();

    fetch('https://a.klaviyo.com/onsite/components/back-in-stock/subscribe', {
      method: 'POST',
      headers: {
        'accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: dataString,
    })
      .then((res) => {
        switch (res.status) {
          case 200:
            setResponseMessage(drawerSettings.successMessage);
            setSubmitted(true);
            break;
          default:
            setSubmitted(true);
            setResponseMessage(drawerSettings.errorMessage);
            setTimeout(() => {
              setSubmitted(false);
            }, 5000);
            throw new Error(`${res.status} Submission Error: ${res.text}`);
        }
      })
      .catch((error) => {
        setSubmitted(true);
        setResponseMessage(drawerSettings.errorMessage);
        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      });
  }

  const currentColor = getOption('color');
  const currentSize = getOption('size');

  useEffect(() => {
    drawer.current.classList.add('is-visible');
    document.addEventListener('closeDrawerOnIndex', closeDrawerOnIndex);
    return () => {
      document.removeEventListener('closeDrawerOnIndex', closeDrawerOnIndex);
    };
  }, []);

  return (
    <div class="drawer drawer--right bis__container" ref={drawer}>
      <div class="drawer__inner bis__inner">
        <div class="drawer__header bis__header">
          <div class="drawer__header-title bis__title">Notify</div>
          <button class="drawer__close bis__close" onClick={closeDrawer}>
            <Close />
            <div className="sr-only">Close Drawer</div>
          </button>
        </div>
        <div class="drawer__body-contents bis__body">
          <div class="bis__featured-image-container frame frame--1x1">
            <div class="sticker sticker--medium bis__sticker">
              <span class="sticker__text">
                Notify
                <br />
                Me
              </span>
            </div>
            {data.variant.featured_image && (
              <img
                src={data.variant.featured_image.src}
                alt={data.variant.featured_image.alt}
                class="bis__featured-image"
              />
            )}
          </div>

          <div
            class="bis__body-info"
            dangerouslySetInnerHTML={{ __html: buildBodyInfo() }}
          ></div>

          <form
            action="/"
            class={`bis__form ${submitted ? 'submitted' : ''}`}
            ref={form}
            onSubmit={onFormSubmit}
          >
            <div class="minimal-input-box">
              <input
                class="bis__input minimal-input-box__input"
                name="email"
                placeholder="What's your email?"
                type="email"
                required
                ref={email}
              />
              <button
                class="bis__submit minimal-input-box__submit"
                type="submit"
              >
                <Arrow />
                <span class="icon-fallback-text">Submit</span>
              </button>
            </div>
          </form>
          <div class="bis__response-message" ref={ messageContainer }>{responseMessage}</div>
          <p
            class="bis__footer-info p2"
            dangerouslySetInnerHTML={{ __html: drawerSettings.footerMessage }}
          ></p>
        </div>
      </div>
    </div>
  );
}