import React, { useRef, useEffect } from 'preact/compat';

const InfoCard = ((props) => {
  const settings = props.block.settings;
  let image;
  let button1;
  let button2;
  let editorBlockData;
  let cardBody;
  const element = useRef(null);

  if(settings.image) {
    image = (<div className="info-card__image-container frame frame--1x1">
              <img src={settings.image} alt={settings.image_alt} className="frame__inner info-card__image" />
            </div>)
  }

  if(settings.card_body) {
    cardBody = settings.card_body.replaceAll('<p>', '<p class="info-card__body">').replaceAll('<strong>', '<strong class="highlighted">')
  }

  if(settings.label_1 && settings.url_1) {
    button1 = (<a href={settings.url_1} className="btn btn-white">{settings.label_1}</a>)
  }

  if(settings.label_2 && settings.url_2) {
    button2 = (<a href={settings.url_2} className="btn btn-white">{settings.label_2}</a>)
  }

  if(Shopify.designMode) {
    editorBlockData = `{"id":"${props.id}", "type":"${props.block.type}"}`
  }

  { useRef, useEffect }useEffect(() => {
    if(props.activeBlock && element.current) {
      element.current.scrollIntoView({behavior: "smooth", block: "center"})
    }
  });

  return (
    <div id={props.id} className="info-card__container" data-shopify-editor-block={editorBlockData} ref={element}>
      {settings.header ? <h2 className="info-card__header">{settings.header}</h2> : '' }
      <div className="info-card">
        {image}
        {settings.title ? <h3 className="info-card__title">{settings.title}</h3> : ''}
        <div dangerouslySetInnerHTML={{__html: cardBody}}></div>
        { button1 || button2 ? <div className="info-card__buttons-container"> {button1} {button2} </div> : '' }
      </div>
    </div>
  )
})

export default InfoCard;