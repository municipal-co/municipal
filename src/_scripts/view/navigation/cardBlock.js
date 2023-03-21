import React, { useRef, useEffect } from 'preact/compat';

const CardBlock = ((props) => {
  const settings = props.block.settings;
  const element = useRef(null);

  const hihglighted_badge = settings.highlight_badge && <b className="card-block__highlight-badge">{settings.highlight_badge}</b>
  const header = settings.title && <h2 className='card-block__header'> {settings.title} </h2>;
  let editorBlockData = ''
  if(Shopify.designMode) {
    editorBlockData = `{"id":"${props.id}", "type":"${props.block.type}"}`
  }{ useRef, useEffect }useEffect(() => {
    if(props.activeBlock && element.current) {
      element.current.scrollIntoView({behavior: "smooth", block: "center"})
    }
  });
  return (
    <a href={settings.url} id={props.id} className={['card-block',
      settings.highlight_card ? 'card-block--highlight' : '',
      settings.top_space ? 'card-block--top-space' : '',
      settings.bottom_space ? 'card-block--bottom-space' : ''].join(' ')}
      data-shopify-editor-block={editorBlockData}
      ref={element}
      >
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
          {settings.card_body && <div className="card-block__description"> { settings.card_body } </div>}
        </div>
      </div>
    </a>
  )
})

export default CardBlock;