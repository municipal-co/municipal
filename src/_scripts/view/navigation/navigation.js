// eslint-disable-next-line max-classes-per-file
import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import BaseSection from '../../sections/base';

import NavigationCategories from './navigationCategories';
import NavigationBlocks from './navigationBlocks';

const MainNav = ((props) => {

  const updateModuleData = (evt) => {
    if(evt.detail.sectionId == props.id) {
      setComponents(getComponents());
      updateCurrentMenu();
    }
  }

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

  const updateCurrentMenu = (evt) => {
    if(evt) {
      setCurrentMenu(evt.target.innerText);
    } else {
      setCurrentMenu(categories[0]);
    }
  }

  const updateSelectedBlock = (evt) => {
    if(evt.detail.sectionId == props.id && selectedBlock != evt.detail.blockId) {
      const currentBlock = components.filter(component => {
        return component.id == evt.detail.blockId
      })
      if(currentBlock.length) {
        setSelectedBlock(evt.detail.blockId);
        setCurrentMenu(currentBlock[0].category);
      }
    }
  }

  const [isOpen, setIsOpen] = useState(false);
  const [components, setComponents] = useState(getComponents() || {});
  const [categories, setCategories] = useState(getCategories());
  const [currentMenu, setCurrentMenu] = useState(categories[0]);
  const [selectedBlock, setSelectedBlock] = useState('');

  //Component will render
  useEffect(() => {
    document.addEventListener('shopify:section:load', updateModuleData);
    document.addEventListener('shopify:section.select', openNavigation);
    document.addEventListener('shopify:section.unselect', closeNavigation);
    document.addEventListener('shopify:block:select', updateSelectedBlock);

    return (() => {
      document.removeEventListener('shopify:section:load', updateModuleData);
      document.removeEventListener('shopify:section:select', openNavigation);
      document.removeEventListener('shopify:section:unselect', closeNavigation);
      document.removeEventListener('shopify:block:select', updateSelectedBlock);
    })
  }, [])

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

