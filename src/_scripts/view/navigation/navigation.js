// eslint-disable-next-line max-classes-per-file
import React from 'react';
import ReactDOM from 'react-dom/client';
import BaseSection from '../../sections/base';

import NavigationMenu from './navigationCategories';
import NavigationBlocks from './navigationBlocks';

class MainNav extends React.Component {
  constructor(props) {
    super(props);

    this.state = Object.assign({}, this.props)

    this.getCategories = this.getCategories.bind(this);
    this.setCurrentCategory = this.setCurrentCategory.bind(this);
  }

  getCategories() {
    const categories = [];

    this.state.data.map( component => {
      if(categories.indexOf(component.category) == -1) {
        categories.push(component.category);
      }
    })

    return categories;
  }

  componentDidMount() {
    const categories = this.getCategories()

    this.setState({
      currentMenu: categories[0]
    })
  }

  setCurrentCategory(evt) {
    evt.preventDefault();
    const category = evt.target.innerText
    this.setState({
      currentMenu: category
    })
  }

  render() {
    const categoryList = this.getCategories()
    return (
      <div>
        <NavigationMenu
          categories={categoryList}
          data={this.state.data}
          clickCallback={this.setCurrentCategory}
          currentMenu={this.state.currentMenu}
        />
        <NavigationBlocks
          components={this.state.data}
          currentMenu={this.state.currentMenu}
        />
      </div>
    )
  }
}

MainNav.defaultProps = {
  isOpen: false,
  currentMenu: '',
  data: JSON.parse(document.querySelector('[data-navigation-json]').innerHTML)
}

export default class Navigation extends BaseSection {
  constructor(container) {
    super(container, 'navigation');
    this.navigationHolder = document.getElementById('main_navigation');

    const root = ReactDOM.createRoot(this.navigationHolder)
    root.render(<MainNav/>);
  }
}

