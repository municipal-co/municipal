import React, {useEffect, useRef} from "react";
import Swiper, { FreeMode, Navigation } from "swiper";
import Image from "../global/image";

const Carousel = ((props) => {
  const s = props.block.settings;
  const aspectRatio = s.aspect_ratio;
  const slider = useRef();
  const sectionTitle = s.section_title ? <div className="navigation-carousel__title">{s.section_title}</div> : '';

  useEffect(() => {
    new Swiper(slider.current, {
      modules: [FreeMode, Navigation],
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
        <a
          href={card.url}
          className={`navigation-carousel__card swiper-slide ${
            card.highlight_card ? 'navigation-carousel--highlighted' : ''
          }`}
          key={index}
        >
          <div
            className={`navigation-carousel__image-container frame ${aspectRatio}`}
          >
            <Image
              src={card.image}
              alt={card.image_alt}
              className="frame__inner navigation-carousel__image"
              loading="lazy"
              sizes={`${aspectRatio == 'frame--3x4' ? '(max-width: 450px) 45w, (max-width: 991px) 310px, 138px': '(max-width: 450px) 80w, (max-width: 991px) 310px, 257px'}`}
            />
          </div>
          <div className="navigation-carousel__card-title">
            {card.highlight_card && (
              <b className="navigation-carousel__highlight-text">
                {card.highlight_badge}
              </b>
            )}
            {card.title}
          </div>
        </a>
      );
    } else {
      return undefined;
    }
  })

  return(
    <div className="navigation-carousel">
     { sectionTitle }
      <div className={`navigation-carousel__slider swiper swiper-container`} ref={slider}>
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