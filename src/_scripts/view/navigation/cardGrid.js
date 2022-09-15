import React from 'react';


const CardGrid = ((props) => {
  const aspectRatio = props.block.settings.aspect_ratio;
  const cards = props.block.settings.cards.map((card, index) => {
    return (
      <a href={card.url} className={`image_card ${card.highlight_card ? 'image_card--highlighted' : ''}`} key={index}>
        <div className={`image-card__image-container frame ${aspectRatio}`}>
            <img src={card.image} alt={card.image_alt} className='frame__inner' />
        </div>
        <div className="image-card__title">
          { card.highlight_card &&
          <b className="image-card__highlight-text">
            {card.highlight_badge}
          </b>}
          { card.title }
        </div>
      </a>
    )
  })
  const sectionTitle = props.block.settings.section_title ? <div className="card-grid__title">{props.block.settings.section_title}</div> : '';
  let editorBlockData = ''
  if(Shopify.designMode) {
    editorBlockData = `{"id":"${props.id}", "type":"${props.block.type}"}`
  }
  return (
    <div className='card-grid' data-shopify-editor-block={editorBlockData}>
      { sectionTitle }

      <div className="card-grid__grid">
        { cards }
      </div>
    </div>
  )
})

export default CardGrid;