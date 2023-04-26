import React, { useEffect, useRef } from "react";
import Close from "../icons/Close";
import {Swiper, SwiperSlide} from 'swiper/react';
import {EffectFade, Pagination} from 'swiper';


export default function FeaturesDrawer({data, index}) {
  const drawer = useRef();
  const sliderPagination = useRef();
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

  const buildSlides = () => {
    return data.detailItems.map(item => {
      return <SwiperSlide>
        <div className="frame frame--1x1">
          <img src={`${item.image}&width=550`} alt="" className="features-detail__image"/>
        </div>
        <div className="features-detail__body-content" dangerouslySetInnerHTML={{__html: item.content}} />
      </SwiperSlide>
    })
  }

  useEffect(() => {
    drawer.current.classList.add('is-visible');
    document.addEventListener('closeDrawerOnIndex', closeDrawerOnIndex);
    return () => {
      document.removeEventListener('closeDrawerOnIndex', closeDrawerOnIndex);
    };
  }, []);

  return(
    <div class="drawer features-detail__drawer" ref={drawer}>
      <div class="drawer__inner">
        <div class="drawer__header features-detail__header">
          <div class="drawer__header-title features-detail__header-title">
            Features & Details
          </div>
          <a href="javascript:void(0);" class="features-detail__close" onclick={closeDrawer}>
            <Close />
            <span class="sr-only">Close features detail drawer</span>
          </a>
        </div>
        <div class="darwer__body-contents features-detail__body">
          <Swiper
            modules={[EffectFade, Pagination]}
            effect='fade'
            fadeEffect={{
              crossFade: true
            }}
            pagination={{
              el: '.features-detail__slider-pagination',
              clickable: true,
            }}
          >
            {buildSlides()}
            <div className="features-detail__slider-pagination" ref={sliderPagination} />
          </Swiper>
          {data.boxDetails &&
            <div class="blink-box blink-box--dark">
              {data.boxTitle &&
                <div className="blink-box__title">
                  {data.boxTitle}
                </div>
              }
              <div className="blink-box__content" dangerouslySetInnerHTML={{__html: data.boxDetails}}></div>
            </div>
          }
        </div>
      </div>
    </div>
  )
}