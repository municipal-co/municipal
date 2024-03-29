import React, { useRef, useEffect } from 'react';
import Image from '../global/image';

const CardGrid = ((props) => {
  const aspectRatio = props.block.settings.aspect_ratio;
  const element = useRef(null);
  const cards = props.block.settings.cards.map((card, index) => {
    return (
      <a
        href={card.url}
        className={`image_card ${
          card.highlight_card ? 'image_card--highlighted' : ''
        }`}
        key={index}
      >
        <div className={`image-card__image-container frame ${aspectRatio}`}>
          <Image
            src={card.image}
            alt={card.image_alt}
            className="frame__inner"
            loading="lazy"
            sizes="(max-width: 450px) 50w, (max-width: 992px) 176px, 148px"
          />
        </div>
        <div className="image-card__title">
          {card.highlight_card && (
            <b className="image-card__highlight-text">{card.highlight_badge}</b>
          )}
          {card.title}
        </div>
      </a>
    );
  })
  const sectionTitle = props.block.settings.section_title ? <div className="card-grid__title">{props.block.settings.section_title}</div> : '';
  let editorBlockData = ''

  if(Shopify.designMode) {
    editorBlockData = `{"id":"${props.id}", "type":"${props.block.type}"}`
  }
{ useRef, useEffect }useEffect(() => {
    if(props.activeBlock && element.current) {
      element.current.scrollIntoView({behavior: "smooth", block: "center"})
    }
  });
  return (
    <div className='card-grid' data-shopify-editor-block={editorBlockData} ref={element}>
      { sectionTitle }

      <div className="card-grid__grid">
        { cards }
      </div>
    </div>
  )
})

export default CardGrid;