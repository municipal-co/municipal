import React, { useEffect, useRef, useState } from 'preact/compat';
import Swiper, { FreeMode, Navigation } from "swiper";

 const NavigationCategories = ((props) => {
  const element = useRef();
  const slideWrapper = useRef();

  useEffect(() => {
    const activeElement = slideWrapper.current.querySelector('.navigation-categories__button--active');
    const activeIndex = Array.from(slideWrapper.current.children).indexOf(activeElement);

    let swiper = new Swiper(element.current, {
      modules: [FreeMode, Navigation],
      slide: '.swiper-slide',
      slidesPerView: "auto",
      slideToClickedSlide: true,
      threshold: 20,
      loop: false,
      navigation: {
        nextEl: '[data-arrow-next]',
        prevEl: '[data-arrow-prev]'
      },
      freeMode: {
        enabled: true,
        sticky: true,
      }
    })
    swiper.slideTo(activeIndex);
  })

  const buildButtons = () => {
    let newCategories = props.categories.map((category, index) => {
    const classNames = props.currentMenu == category ?
      'swiper-slide navigation-categories__button navigation-categories__button--active' :
      'swiper-slide navigation-categories__button'

      return (<button key={index} className={classNames} onClick={props.clickCallback}> {category} </button>)
    })

    return newCategories;
  }

  return (
    <div className="navigation-categories swiper swiper-container" ref={element}>
      <div className="swiper-wrapper" ref={slideWrapper}>
        {buildButtons()}
      </div>
      <div className="navigation-areas-container">
        <div className="navigation-area--prev" data-arrow-prev></div>
        <div className="navigation-area--next" data-arrow-next></div>
      </div>
    </div>
  )
})

export default NavigationCategories;