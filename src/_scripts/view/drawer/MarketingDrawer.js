import React, { useState, useEffect, useRef } from 'preact/compat';
import Arrow from '../icons/Arrow';
import Close from '../icons/Close';
import Image from '../global/image';

export default function MarketingDrawer({data, index}) {
  const drawer = useRef(null);
  const email = useRef(null);
  const drawerSettings = JSON.parse(document.querySelector('[data-marketing-drawer-settings]').innerHTML);
  const [submitted, setSubmitted] = useState(false);
  const [responseMessage, setResponseMessage] = useState(null);

  const closeDrawer = () => {
    const event = new CustomEvent('drawerClose');
    drawer.current.classList.remove('is-visible');

    if (index == 0) {
      document.dispatchEvent(new CustomEvent('closeLastDrawer'));
    }
    drawer.current.addEventListener('transitionend', () => {
      document.dispatchEvent(event);
    });
  };

  const buildNotifyText = () => {
    return drawerSettings.notifyText.replace(
      '[[product]]',
      `<span class="highlighted">${data.productName}</span>`
    )
  }

  const closeDrawerOnIndex = (evt) => {
    const eventIndex = evt.detail.drawerIndex;
    if (index === eventIndex) {
      closeDrawer();
    }
  };

  const submitForm = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    const fieldName = `Notify - ${data.productName}`;

    const formData = {
      g: "Jgkkps",
      $email: email.current.value,
      $source: 'Marketing Drawer',
      $fields: `$source, $email, ${fieldName}`,
    }

    formData[fieldName] = true;

    const dataString = new URLSearchParams(formData).toString();

    fetch('//manage.kmail-lists.com/ajax/subscriptions/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cache-Control': 'no-cache',
      },
      body: dataString
    }).then(res => {
      switch(res.status) {
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
          throw new Error(`${res.status} Submission Error: ${res.text}`)
      }
    }).catch(error => {
      setResponseMessage('There was an error with your submission, please try again later.');
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    })
  }

  const clearMessage = () => {
    setResponseMessage('');
  }

  useEffect(() => {
    drawer.current.classList.add('is-visible');
    document.addEventListener('closeDrawerOnIndex', closeDrawerOnIndex);
    return () => {
      document.removeEventListener('closeDrawerOnIndex', closeDrawerOnIndex);
    };
  }, []);

  return (
    <div className="drawer mkt-subscription__container" ref={drawer}>
      <div className="drawer__inner mkt-subscription__inner">
        <div className="drawer__header mkt-subscription__header">
          <div className="drawer__header-title mkt-subscription__title">Notify</div>
          <button
            className="drawer__close mkt-subscription__close"
            onClick={closeDrawer}
          >
            <Close />
            <div className="sr-only">Close drawer</div>
          </button>
        </div>
        <div className="drawer__body-contents mkt-subscription__body">
          <div className="mkt-subscription__image-container frame frame--1x1">
            {data.image && (
              <Image
                src={data.image}
                className="mkt-subscription__image frame__inner"
                loading="lazy"
                sizes="(max-width: 992px) 100vw, 560px"
              />
            )}
          </div>

          {drawerSettings.notifyText && (
            <div
              className="mkt-subscription__body-info"
              dangerouslySetInnerHTML={{ __html: buildNotifyText() }}
            ></div>
          )}

          <form
            action="//manage.kmail-lists.com/ajax/subscriptions/subscribe"
            className={`mkt-subscription__form ${submitted ? 'submitted' : ''}`}
            onSubmit={submitForm}
          >
            <div className="minimal-input-box">
              <input
                className="mkt-subscription__input minimal-input-box__input"
                name="email"
                placeholder="What's your email?"
                type="email"
                ref={email}
                required
              />
              <button
                className="mkt-subscription__submit minimal-input-box__submit"
                type="submit"
              >
                <Arrow />
                <span className="icon-fallback-text">Submit</span>
              </button>
            </div>
          </form>
          <div
            className="mkt-subscription__response-message"
          >
            {responseMessage}
          </div>
          {drawerSettings.footerMessage && (
            <div
              className="mkt-subscription__footer-info"
              dangerouslySetInnerHTML={{ __html: drawerSettings.footerMessage }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
}