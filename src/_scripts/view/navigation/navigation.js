import React, {useState, useEffect, useRef} from 'react';

import NavigationCategories from './navigationCategories';
import NavigationBlocks from './navigationBlocks';

const MainNav = ((props) => {

  const getComponentData = () => {
    const components = getComponents();
    const categories = getCategories(components);
    const currentMenu = data ? data.currentMenu : categories[0];

    const componentData = {
      components,
      categories,
      currentMenu,
      currentBlock: ''
    }

    return componentData ;
  }

  const updateModuleData = (evt) => {
    if(evt.detail.sectionId == id) {
      setData(getComponentData());
    }
  }

  const getComponents = (evt) => {
    return JSON.parse(document.querySelector('[data-navigation-json]').innerHTML);
  }

  const openNavigation = (evt) => {
    if(evt?.detail.sectionId && evt?.detail?.sectionId !== id) {
      return;
    }

    setIsOpen(true);
    document.dispatchEvent(new CustomEvent('drawer:open'));
  }

  const closeNavigation = (evt) => {
    if(evt?.detail?.sectionId && evt?.detail?.sectionId !== id) {
      return;
    }

    if(evt?.detail?.target === 'navigation') {
      return;
    }

    setIsOpen(false);
  }

  const getCategories = (components) => {
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
      setData(Object.assign({}, data, {currentMenu: evt.target.innerText}));
    } else {
      setData(Object.assign({}, data, {currentMenu: categories[0]}));
    }
  }

  const updateSelectedBlock = (evt) => {
    if(evt.detail.sectionId == id) {
      const components = getComponents();
      const activeBlock = components.find(component => {
        return component.id == evt.detail.blockId
      })

      if(activeBlock) {
        const categories = getCategories(components);
        const currentMenu = activeBlock.category;
        const currentBlock = activeBlock.id;

        setData(Object.assign({}, data, {
          components,
          categories,
          currentMenu,
          currentBlock
        }))
      }
    }
  }

  const toggleNavigation = () => {
    updateHeaderOffset()
    setIsOpen((isOpen) => !isOpen);
    if(!isOpen) {
      document.dispatchEvent(new CustomEvent('drawer:open', {detail: {target:'navigation'}}))
    }
  }

  const updateHeaderOffset = () => {
    const spaceTop = header.offsetHeight + header.getBoundingClientRect().top;
    setStyles({
      top: spaceTop,
      height: `calc(100% - ${spaceTop}px)`
    })
  }

  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(getComponentData());
  const element = useRef();
  const navBody = useRef();
  const header = document.querySelector('[data-header]');
  const [styles, setStyles] = useState({
    top: header.offsetHeight,
    height: `calc(100% - ${header.offsetHeight}px)`
  });
  const id = document.querySelector('[data-navigation-json]').dataset.sectionId;
  const toggleButton = document.querySelector('[data-mobile-menu-toggle]');

  //Component will render
  useEffect(() => {
    document.addEventListener('shopify:section:load', updateModuleData);
    document.addEventListener('shopify:section:select', openNavigation);
    document.addEventListener('shopify:section:deselect', closeNavigation);
    document.addEventListener('shopify:block:select', updateSelectedBlock);
    document.addEventListener('navigation:toggle', toggleNavigation);
    document.addEventListener('breakpointChange', updateHeaderOffset);
    document.addEventListener('drawer:open', closeNavigation)
    return () => {
      document.removeEventListener('shopify:section:load', updateModuleData);
      document.removeEventListener('shopify:section:select', openNavigation);
      document.removeEventListener('shopify:section:deselect', closeNavigation);
      document.removeEventListener('shopify:block:select', updateSelectedBlock);
      document.removeEventListener('navigation:toggle', toggleNavigation);
      document.removeEventListener('breakpointChange', updateHeaderOffset);
      document.removeEventListener('drawer:open', closeNavigation)
    }
  }, [])

  useEffect(() => {
    const action = isOpen ? 'add' : 'remove';
    toggleButton.classList[action]('is-open');
    document.querySelector('body').classList[action]('drawer-open');
  }, [isOpen])

  return (
    <div className={`navigation ${isOpen ? 'is-visible' : ''}`} ref={element} style={styles}>
      <div className="navigation-body" ref={navBody}>
        <NavigationCategories
          key="NavigationCategories"
          categories={data.categories}
          clickCallback={updateCurrentMenu}
          currentMenu={data.currentMenu}
        />
        <NavigationBlocks
          key="NavigationBlocks"
          components={data.components}
          currentMenu={data.currentMenu}
          currentBlock={data.currentBlock}
        />
      </div>
      <div className="navigation-backdrop" onClick={() => setIsOpen(false)}></div>
    </div>
  )
})

export default MainNav;

