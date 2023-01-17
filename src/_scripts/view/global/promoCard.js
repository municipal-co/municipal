import React from "react";

const promoCard = ((props) => {
  return (
    <div key={props.data.id} className="promo-card">
      <a href={props.data.redirect_link} style={{position: 'relative'}}>
        <img src={props.data.image_url} alt={props.data.title}/>
        <div className="promo-card__footer">
          <div className="promo-card__text">{props.data.cta_text}</div>
          <span className="promo-card__icon icon--arrow-right"></span>
        </div>
      </a>
    </div>
  )
})

export default promoCard;