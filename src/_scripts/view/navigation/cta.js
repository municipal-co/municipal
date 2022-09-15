import React from "react";

const Cta = ((props) =>  {
  return (
    <a href={props.block.settings.url} className={`cta ${props.block.settings.top_space ? 'cta--top-space' : ''} ${props.block.settings.bottom_space ? 'cta--bottom-space': ''}`} target={props.block.settings.new_tab ? '_blank' : ''}>
        <span className="cta__label"> {props.block.settings.label} </span>
        <div className="cta__icon">
          <span className="cta__arrow-icon"></span>
        </div>
      </a>
    )
  }
);

export default Cta;