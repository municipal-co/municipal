import React, { useEffect, useRef } from 'preact/compat';

const Cta = ((props) =>  {
  let editorBlockData = ''
  const element = useRef(null);

  if(Shopify.designMode) {
    editorBlockData = `{"id":"${props.id}", "type":"${props.block.type}"}`
  }
  { useRef, useEffect }useEffect(() => {
    if(props.activeBlock && element.current) {
      element.current.scrollIntoView({behavior: "smooth", block: "center"})
    }
  });
  return (
    <a href={props.block.settings.url} className={`cta ${props.block.settings.top_space ? 'cta--top-space' : ''} ${props.block.settings.bottom_space ? 'cta--bottom-space': ''}`} target={props.block.settings.new_tab ? '_blank' : ''}
      data-shopify-editor-block={editorBlockData}
      ref={element}>
        <span className="cta__label"> {props.block.settings.label} </span>
        <div className="cta__icon">
          <span className="cta__arrow-icon"></span>
        </div>
      </a>
    )
  }
);

export default Cta;