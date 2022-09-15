import React, { useState } from "react";
import CardGrid from "./cardGrid";
import Cta from "./cta";
import CardBlock from "./cardBlock";

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
        default:
          return false;
      }
    })
    return blocks;
  }

  return (
    <ul className="navigation-blocks">
      {buildComponentBlocks()}
    </ul>
  )
})

export default NavigationBlocks;