import React, {useEffect, useRef} from 'preact/compat';
import { SnapScrollSlide, SnapScrollSlider } from '../utils/ScrollSnapSlider';

const Carousel = ((props) => {
  const s = props.block.settings;
  const aspectRatio = s.aspect_ratio;
  const sectionTitle = s.section_title && <div className="navigation-carousel__title">{s.section_title}</div>;

  const cards = s.cards.map((card, index) => {
    if(card.image){
      return (
        <SnapScrollSlide>
          <a href={card.url} className={`navigation-carousel__card ${card.highlight_card ? 'navigation-carousel--highlighted' : ''}`} key={index}>
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
        </SnapScrollSlide>
      )
    } else {
      return undefined;
    }
  })

  return(
    <div className="navigation-carousel">
     { sectionTitle }
     <div className="navigation-carousel__slider">
        <SnapScrollSlider className=""
        settings={{
          prevArrow: '[data-arrow-prev]',
          nextArrow: '[data-arrow-next]',
          enableArrows: true,
          enableScrollbar: true,
          paddingBefore: "30px",
          paddingAfter: "30px",
          slidesPerView: aspectRatio == 'frame--16x9' ? 1.5 : 2.3,
          breakpoints: {
            992: {
              paddingBefore: "40px",
              paddingAfter: "40px",
              slidesPerView: aspectRatio == 'frame--16x9' ? 1.8 : 3.5
            }
          }
          }}>
          { cards }
        </SnapScrollSlider>
        <div className="navigation-carousel__arrow--prev" data-arrow-prev></div>
        <div className="navigation-carousel__arrow--next" data-arrow-next></div>
      </div>
    </div>
  )
})

export default Carousel;