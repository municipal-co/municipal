import React from "react";

export default class Cta extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <a href={this.props.block.settings.url} className={`cta ${this.props.block.settings.top_space ? 'cta--top-space' : ''} ${this.props.block.settings.bottom_space ? 'cta--bottom-space': ''}`} target={this.props.block.settings.new_tab ? '_blank' : ''}>
        <span className="cta__label"> {this.props.block.settings.label} </span>
        <div className="cta__icon">
          <span className="cta__arrow-icon"></span>
        </div>
      </a>
    )
  }
}