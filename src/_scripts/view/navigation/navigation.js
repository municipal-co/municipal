// eslint-disable-next-line max-classes-per-file
import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import BaseSection from '../../sections/base';

import NavigationCategories from './navigationCategories';
import NavigationBlocks from './navigationBlocks';

const MainNav = ((props) => {
  const getComponents = (evt) => {
    return JSON.parse(document.querySelector('[data-navigation-json]').innerHTML);
  }

  const openNavigation = (evt) => {
    if(evt.detail.sectionId !== props.id) {
      return;
    }

    setIsOpen(true);
  }

  const closeNavigation = (evt) => {
    if(evt.detail.sectionId !== props.id) {
      return;
    }

    setIsOpen(false);
  }

  const getCategories = () => {
    const newCategories = [];

    components.map( component => {
      if(newCategories.indexOf(component.category) == -1 && component.category != '') {
        newCategories.push(component.category);
      }
    })

    return newCategories;
  }

  const updateCurrentMenu = (evt) =>{
    if(evt) {
      setCurrentMenu(evt.target.innerText);
    } else {
      setCurrentMenu(getCurrentMenu());
    }
  }

  const [isOpen, setIsOpen] = useState(false);
  const [components, setComponents] = useState(getComponents() || {});
  const [categories, setCategories] = useState(getCategories());
  const [currentMenu, setCurrentMenu] = useState(categories[0]);

  useEffect(() => document.addEventListener('shopify:section:load', (evt) => {
    if(evt.detail.sectionId == id) {
      setComponents(getComponents());
      updateCurrentMenu();
    }
  }));
  useEffect(() => document.addEventListener('shopify:section.select', openNavigation), [isOpen]);
  useEffect(() => document.addEventListener('shopify:section.unselect', closeNavigation), [isOpen]);

  return (
    <div className={`main-navigation ${ isOpen ? '':'hidden'}`}>
      <NavigationCategories
        key="NavigationCategories"
        categories={categories}
        clickCallback={updateCurrentMenu}
        currentMenu={currentMenu}
      />
      <NavigationBlocks
        key="NavigationBlocks"
        components={components}
        currentMenu={currentMenu}
      />
    </div>
  )
})
export default class Navigation extends BaseSection {
  constructor(container) {
    super(container, 'navigation');
    this.navigationHolder = document.getElementById('main_navigation');

    const root = ReactDOM.createRoot(this.navigationHolder)
    root.render(<MainNav id={this.navigationHolder.dataset.sectionId}/>);
  }
}

