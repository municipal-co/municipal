import React from "react";

export default class NavigationMenu extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const categories = this.props.categories.map((category, index) => {
      const classNames = this.props.currentMenu == category ?
        'category-button btn category-button--active btn-secondary' :
        'category-button btn btn-primary'

      return (<button key={index} className={classNames} onClick={this.props.clickCallback}> {category} </button>)
    })
    return (<div className="navigation">
      {categories}
    </div>)
  }
}