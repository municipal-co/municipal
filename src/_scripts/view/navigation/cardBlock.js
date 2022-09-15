import React from "react";

const CardBlock = ((props) => {
  const settings = props.block.settings;

  const hihglighted_badge = settings.highlight_badge && <b classname="card-block__highlight-badge">{settings.highlight_badge}</b>
  const header = settings.title && <div className='card-block__title'> {settings.title} </div>;

  return (
    <a href={settings.url} id={props.block.id} className={`card-block
      ${settings.highlight_card && 'card-block--highlight'}
      ${settings.top_space && 'card-block--top-space'}
      ${settings.bottom_space && 'card-block--bottom-space'}
      `}>
      { header }
      <div className="card-block__content">
        <div className="card-block__image-container frame frame--16x9">
          <img className="card-block__image frame__inner" src={ settings.image } alt={ settings.image_alt } />
        </div>
        <div className="card-block__body-container">
          <div className="card-block__title">
            { settings.highlight_card && hihglighted_badge }
            { settings.card_title && settings.card_title }
          </div>
        </div>
      </div>
    </a>
  )
})

export default CardBlock;