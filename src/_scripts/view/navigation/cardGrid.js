import React from 'react';

export default class CardGrid extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if( !this.props.block.settings) {
      console.log('no settings');
      return false
    }
    const cards = this.props.block.settings.cards.map((card, index) => {
      const aspectRatio = this.props.block.settings.aspect_ratio;

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
    });

    const sectionTitle = this.props.block.settings.section_title && <h3 className='card-grid-title h5'>{ this.props.block.settings.title }</h3>;

    return (
      { sectionTitle },
      <div className='card-grid'>
        { cards }
      </div>
    )
  }
}