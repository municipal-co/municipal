import React, { useEffect, useState } from 'preact/compat';
import MentorDrawer from './MentorDrawer';
import ShopTheLookDrawer from './ShopTheLookDrawer';
import SizeDrawer from './SizeDrawer';
import MarketingDrawer from './MarketingDrawer';
import BackInStockDrawer from './BackInStockDrawer';
import FeaturesDrawer from './FeaturesDrawer';
import SizeGuideDrawer from './SizeGuideDrawer';
import Reviews from './Reviews';

export default function DrawerSystem() {
  const [drawers, setDrawers] = useState([]);
  const [backdropEnabled, setBackdropEnabled] = useState(false);
  const addDrawer = (evt) => {
    const modalData = evt.detail;

    setDrawers((drawers) => {
      const newDrawers = drawers.concat([modalData]);
      document.body.classList.add('drawer-open');
      setBackdropEnabled(true);

      return newDrawers;
    });
  };

  const removeDrawer = (evt) => {
    setDrawers((drawers) => {
      drawers.pop();
      const newDrawers = [].concat(drawers);

      if (newDrawers.length == 0) {
        document.body.classList.remove('drawer-open');
        setBackdropEnabled(false);
      }

      return newDrawers;
    });


  };

  const buildDrawers = () => {
    return drawers.map((drawer, index) => {
      switch (drawer.type) {
        case 'shop-the-look':
          return (
            <ShopTheLookDrawer
              data={drawer.productsData}
              key={`drawer-${index}`}
              index={index}
            />
          );
        case 'marketing-drawer':
          return <MarketingDrawer data={drawer} key={`drawer-${index}`} index={index} />;
        case 'bis-drawer':
          return (
            <BackInStockDrawer
              data={drawer}
              key={`drawer-${index}`}
              index={index}
            />
          );
        case 'option-drawer':
          return (
            <SizeDrawer data={drawer} key={`drawer-${index}`} index={index} />
          );
        case 'mentor-drawer':
          return (
            <MentorDrawer data={drawer} key={`drawer-${index}`} index={index} />
          );
        case 'pdp-features':
          return (
            <FeaturesDrawer data={drawer} key={`drawer-${index}`} index={index} />
          )
        case 'sizing-drawer':
          return (
            <SizeGuideDrawer data={drawer} key={`drawer-${index}`} index={index} />
          )
        case 'reviews':
          return (
            <Reviews key={`drawer-${index}`} index={index} />
          )
      }
    });
  };

  const closeDrawerByIndex = () => {
    const event = new CustomEvent('closeDrawerOnIndex', {
      detail: { drawerIndex: drawers.length - 1 },
    });
    document.dispatchEvent(event);
    if (drawers.length - 1 === 0) {
      removeBackdrop();
    }
  };

  const removeBackdrop = () => {
    setBackdropEnabled(false);
    document.body.classList.remove('drawer-open');
  };

  useEffect(() => {
    document.addEventListener('drawerOpen', addDrawer);
    document.addEventListener('drawerClose', removeDrawer);
    document.addEventListener('closeLastDrawer', removeBackdrop);
    return () => {
      document.removeEventListener('drawerOpen', addDrawer);
      document.removeEventListener('drawerClose', removeDrawer);
      document.removeEventListener('closeLastDrawer', removeBackdrop);
    };
  }, []);

  return (
    <div className="drawers-container-child" key="drawers-container">
      {buildDrawers()}
      <div
        className={`drawer-backdrop ${backdropEnabled ? 'is-visible' : null}`}
        key="drawers-backdrop"
        onClick={closeDrawerByIndex}
      ></div>
    </div>
  );
}
