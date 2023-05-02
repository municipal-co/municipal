import React, { useEffect, useRef, useState } from "preact/compat"
import Arrow from "../icons/Arrow";
import Close from "../icons/Close"
import Image from "../global/image";

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
    <div className="drawer drawer--right bis__container" ref={drawer}>
      <div className="drawer__inner bis__inner">
        <div className="drawer__header bis__header">
          <div className="drawer__header-title bis__title">Notify</div>
          <button className="drawer__close bis__close" onClick={closeDrawer}>
            <Close />
            <div className="sr-only">Close Drawer</div>
          </button>
        </div>
        <div className="drawer__body-contents bis__body">
          <div className="bis__featured-image-container frame frame--1x1">
            <div className="sticker sticker--medium bis__sticker">
              <span className="sticker__text">
                Notify
                <br />
                Me
              </span>
            </div>
            {data.variant.featured_image && (
              <Image
                src={data.variant.featured_image.src}
                alt={data.variant.featured_image.alt}
                className="bis__featured-image"
                sizes="(max-width: 992px) 100vw, 500px"
              />
            )}
          </div>

          <div
            className="bis__body-info"
            dangerouslySetInnerHTML={{ __html: buildBodyInfo() }}
          ></div>

          <form
            action="/"
            className={`bis__form ${submitted ? 'submitted' : ''}`}
            ref={form}
            onSubmit={onFormSubmit}
          >
            <div className="minimal-input-box">
              <input
                className="bis__input minimal-input-box__input"
                name="email"
                placeholder="What's your email?"
                type="email"
                required
                ref={email}
              />
              <button
                className="bis__submit minimal-input-box__submit"
                type="submit"
              >
                <Arrow />
                <span className="icon-fallback-text">Submit</span>
              </button>
            </div>
          </form>
          <div className="bis__response-message" ref={ messageContainer }>{responseMessage}</div>
          <p
            className="bis__footer-info p2"
            dangerouslySetInnerHTML={{ __html: drawerSettings.footerMessage }}
          ></p>
        </div>
      </div>
    </div>
  );
}