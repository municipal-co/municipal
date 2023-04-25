import React, {useEffect, useRef, useState} from "react";
import Close from "../icons/Close";

export default function Reviews({data, index}) {
  const drawer = useRef();
  const reviewsContainer = useRef();
  const productSettings = JSON.parse(document.querySelector('[data-product-json]').innerHTML);
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

  const mutationHandler = (mutationRecords) => {
    mutationRecords.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(singleNode, index) {
        if(index == mutation.addedNodes.length - 1) {
          formatMessages();
          drawer.current.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        }
      });
    });
  }

  const buildFitSizeTemplate = (value) => {
    return `<div class="yotpo-user-field size-fit-field modified-field" data-type="SingleValue">
    <span class="yotpo-user-field-description text-s">Size Fit:</span>
    <span class="yotpo-user-field-answer text-s"> ${value} </span>
  </div>`
  }

  const verifiedTemplate = `<div class="label-with-tooltip pull-left" aria-level="3">
    <span class="y-label yotpo-user-title yotpo-action-hover" data-type="toggleFade" data-target="yotpo-tool-tip" aria-describedby="179043713">Verified Reviewer</span>
  </div>`

  const formatMessages = () => {
    if(reviewsContainer.current) {
      const sizesLabel = reviewsContainer.current.querySelectorAll('.yotpo-size-field-titles label');
      const sizesValues = [];

      Array.from(sizesLabel).forEach(label => {
        sizesValues.push(label.innerText);
      })

      const reviews = reviewsContainer.current.querySelectorAll('.yotpo-review:not(.yotpo-hidden):not(.modified)');

      Array.from(reviews).forEach(review => {
        review.classList.add('modified');
        const firstHeaderElement = review.querySelector('.yotpo-header-element:not(.yotpo-icon-profile)');
        const userFields = firstHeaderElement.querySelector('.yotpo-user-related-fields');

        const yotpoFitSizeEval = review.querySelector('.product-related-fields-item[data-type="Size"] .product-related-fields-item-value').innerText;
        userFields.insertAdjacentHTML('afterbegin', buildFitSizeTemplate(yotpoFitSizeEval))

        const verifiedLabel = firstHeaderElement.querySelector('.label-with-tooltip');

        if(verifiedLabel && verifiedLabel.className.indexOf('yotpo-hidden') == -1) {
          userFields.insertAdjacentHTML('afterbegin', verifiedTemplate);
        }
        const userFieldChildren = Array.from(userFields.querySelectorAll('.yotpo-user-field'));

        const secondToLastUserField = userFieldChildren[userFieldChildren.length - 2];
        const recommendValue = secondToLastUserField.querySelector('.yotpo-user-field-answer');

        secondToLastUserField.classList.add('recommend-field');

        if(recommendValue.innerText === 'Yes') {
          recommendValue.innerText = recommendValue.innerText.replace('Yes', 'Yes 👍');
        } else {
          recommendValue.innerText = recommendValue.innerText.replace('No', 'No ❌');

        }
      })
    }
  }

  const yotpoReadyCallBack = () => {
    if(reviewsContainer.current) {
      formatMessages();
      mutationObserver.observe(reviewsContainer.current, observerSettings);
    }
  }

  const mutationObserver = new MutationObserver(mutationHandler);
  const observerSettings = {
    childList: true,
    subtree: true,
  }

  useEffect(() => {
    drawer.current.classList.add('is-visible');
    if(window.yotpo) {
      window.yotpo.on('ready', yotpoReadyCallBack);
      window.yotpo.on('pageChanged', yotpoReadyCallBack);
      window.yotpo.refreshWidgets();
    }

    document.addEventListener('closeDrawerOnIndex', closeDrawerOnIndex);
    return () => {
      document.removeEventListener('closeDrawerOnIndex', closeDrawerOnIndex);
      if(window.yotpo) {
        mutationObserver.disconnect();
      }
    };
  }, []);

  return (
    <div class="drawer reviews__drawer" ref={drawer}>
      <div class="drawer__inner reviews__drawer-inner">
        <div class="drawer__header reviews__drawer-header">
          <div class="drawer__header-title reviews__drawer-title">
            Reviews
          </div>
          <a href="javascript:void(0);"class="drawer__close" onClick={closeDrawer}>
            <Close />
            <span class="sr-only">Close size guide</span>
          </a>
        </div>
        <div class="drawer__body-contents reviews__drawer-body">
          <div id="product-reviews" class="yotpo-reviews-container">
            <div  class="yotpo yotpo-main-widget"
                  ref={reviewsContainer}
                  data-product-id={productSettings.id}
                  data-name={productSettings.title}
                  data-url={productSettings.url}
                  data-image-url={productSettings.image}
                  data-description={productSettings.description}
            />
          </div>
        </div>
      </div>
    </div>
  )
}