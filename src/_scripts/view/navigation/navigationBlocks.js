import React, { useState } from "react";
import CardGrid from "./cardGrid";
import Cta from "./cta";
import CardBlock from "./cardBlock";
import InfoCard from "./infoCard";
import Carousel from './carousel';
import AccountForms from "./accountForms";
import AccountLinks from "./accountLinks";

const NavigationBlocks = ((props) => {

  const getActiveBlocks = () => {
    const activeBlocks = props.components.filter(component => component.category == props.currentMenu)

    return activeBlocks;
  }

  const buildComponentBlocks = () => {
    const blocks = getActiveBlocks().map( block => {
      const isActiveBlock = block.id == props.currentBlock;
      switch (block.type) {
        case 'card_grid':
          return <CardGrid key={block.id} id={block.id} block={block} activeBlock={isActiveBlock}/>
        case 'cta':
          return <Cta key={block.id} id={block.id} block={block} activeBlock={isActiveBlock}/>
        case 'card_block':
          return <CardBlock key={block.id} id={block.id} block={block} activeBlock={isActiveBlock}/>
        case 'info_card':
          return <InfoCard key={block.id} id={block.id} block={block} activeBlock={isActiveBlock}/>
        case 'carousel':
          return <Carousel key={block.id} id={block.id} block={block} activeBlock={isActiveBlock}/>
        case 'account-forms':
          return <AccountForms key={block.id} id={block.id} />
        case 'account-links':
          return <AccountLinks key={block.id} id={block.id} />
        default:
          return false;
      }
    })
    return blocks;
  }

  return (
    <div className="navigation-blocks">
      {buildComponentBlocks()}
    </div>
  )
})

export default NavigationBlocks;