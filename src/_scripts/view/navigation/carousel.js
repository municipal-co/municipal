import React, {useEffect, useRef} from "react";
import Swiper from "swiper";
const Carousel = ((props) => {
  const s = props.block.settings;
  const aspectRatio = s.aspect_ratio;
  const slider = useRef();
  const sectionTitle = s.section_title ? <div className="navigation-carousel__title">{s.section_title}</div> : '';

  useEffect(() => {
    new Swiper(slider.current, {
      slide: '.swiper-slide',
      slidesPerView: aspectRatio == 'frame--16x9' ? 1.2 : 2.1,
      threshold: 20,
      loop: false,
      spaceBetween: 15,
      navigation: {
        nextEl: '[data-arrow-next]',
        prevEl: '[data-arrow-prev]'
      },
      freeMode: {
        enabled: true,
        sticky: true,
      },
      breakpoints: {
        992: {
          slidesPerView: aspectRatio == 'frame--16x9' ? 1.8 : 3.2,
        }
      }
    })
  })

  const cards = s.cards.map((card, index) => {
    if(card.image){
      return (
        <a href={card.url} className={`navigation-carousel__card swiper-slide ${card.highlight_card ? 'navigation-carousel--highlighted' : ''}`} key={index}>
          <div className={`navigation-carousel__image-container frame ${aspectRatio}`}>
              <img src={card.image} alt={card.image_alt} className='frame__inner navigation-carousel__image' />
          </div>
          <div className="navigation-carousel__card-title">
            { card.highlight_card &&
            <b className="navigation-carousel__highlight-text">
              {card.highlight_badge}
            </b>}
            { card.title }
          </div>
        </a>
      )
    } else {
      return undefined;
    }
  })

  return(
    <div className="navigation-carousel">
     { sectionTitle }
      <div className={`navigation-carousel__slider swiper-container`} ref={slider}>
        <div className="swiper-wrapper">
          { cards }
        </div>
        <div className="navigation-carousel__arrows-container">
          <div className="navigation-carousel__arrow--prev" data-arrow-prev></div>
          <div className="navigation-carousel__arrow--next" data-arrow-next></div>
        </div>
      </div>
    </div>
  )
})

export default Carousel;