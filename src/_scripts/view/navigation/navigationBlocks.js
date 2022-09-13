import React from "react";
import CardGrid from "./cardGrid";
import Cta from "./cta";

export default class NavigationBlocks extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeBlocks: []
    }

    this.getActiveBlocks = this.getActiveBlocks.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    const activeBlocks = this.getActiveBlocks();
    if(this.props.currentMenu !== prevProps.currentMenu) {
      this.setState({
        activeBlocks: activeBlocks
      })
    }
  }

  getActiveBlocks() {
    const activeBlocks = this.props.components.filter(component => {
      return component.category == this.props.currentMenu
    })

    return activeBlocks;
  }

  render() {
    const blocks = this.state.activeBlocks.map( block => {
      switch (block.type) {
        case 'card_grid':
          return <CardGrid key={block.id} block={block} />
        case 'cta':
          return <Cta key={block.id} block={block} />
        default:
          return false;
      }
    })
    return (
      <ul className="navigation-blocks">
        {blocks}
      </ul>
    )
  }
}