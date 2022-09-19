import React, { useState } from "react";
import CardGrid from "./cardGrid";
import Cta from "./cta";
import CardBlock from "./cardBlock";
import InfoCard from "./infoCard";

const NavigationBlocks = ((props) => {

  const getActiveBlocks = () => {
    const activeBlocks = props.components.filter(component => component.category == props.currentMenu)

    return activeBlocks;
  }

  const buildComponentBlocks = () => {
    const blocks = getActiveBlocks().map( block => {
      switch (block.type) {
        case 'card_grid':
          return <CardGrid key={block.id} id={block.id} block={block} />
        case 'cta':
          return <Cta key={block.id} id={block.id} block={block} />
        case 'card_block':
          return <CardBlock key={block.id} id={block.id} block={block} />
        case 'info_card':
          return <InfoCard key={block.id} id={block.id} block={block} />
        default:
          return false;
      }
    })
    return blocks;
  }

  const buildComponentsReferences = () => {
    const references = props.components.map( component => {
      return <div key={component.id+"editor"} data-shopify-editor-block={`{"id":"${component.id}", "type": "${component.type}"}`}></div>
    })

    return references;
  }

  return (
    <div className="navigation-blocks">
      {buildComponentBlocks()}
      {Shopify.designMode ? buildComponentsReferences() : ''}
    </div>
  )
})

export default NavigationBlocks;