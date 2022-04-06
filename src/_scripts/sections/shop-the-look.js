import $ from 'jquery'; // eslint-disable-line no-unused-vars
import Swiper from 'swiper';
import Drawer from '../ui/drawer'
import BaseSection from './base';

const selectors = {
  looksContainer: '[data-looks-container]',
  lookDrawers: '[data-drawer]',
  lookDrawerOpen: '[data-look-drawer-open]',
  lookDrawerSlider: '[data-product-slider]'
};

export default class ShopTheLook extends BaseSection {
  constructor(container) {
    super(container, 'shopTheLook');

    this.drawerList = [];

    this.$looksContainer = $(selectors.looksContainer, this.$container);
    this.$looksDrawers = $(selectors.lookDrawers, this.$container);
    this.$lookDrawerOpen = $(selectors.lookDrawerOpen, this.$container);

    this.$lookDrawerOpen.on('click', this.openDrawer.bind(this));

    this.initLooksSlider();
    this.initLooksDrawers();
    this.initDrawerSlider();
  };

  initLooksSlider() {
    const looksSliderOptions = {
      slidesPerView: 1.5,
      loop: false,
      spaceBetween: 15,
      slidesOffsetBefore: 30,
      slidesOffsetAfter: 30,
      freeMode: {
        enabled: true,
        sticky: true,
      }
    }

    this.looksSlider = new Swiper(this.$looksContainer, looksSliderOptions);
  }

  initLooksDrawers() {
    this.$looksDrawers.each((i, drawer) => {
      const $this = $(drawer);
      const id = $this.data('drawer-id');

      const drawerObject = new Drawer($this);

      this.drawerList.push({
        drawerObject,
        id
      })
    })
  }

  openDrawer(evt) {
    const $this = $(evt.currentTarget)
    const drawerId = $this.data('look-drawer-open');

    const drawer = this.getDrawerById(drawerId);

    drawer.show();
  }

  getDrawerById(id) {
    let currentDrawer = null;

    this.drawerList.forEach(drawer => {
      if(drawer.id === id) {
        currentDrawer = drawer.drawerObject;
      }
    });

    return currentDrawer;
  }

  initDrawerSlider() {
    this.drawerList.forEach((drawer, i) => {
      const slider = drawer.drawerObject.$el.find(selectors.lookDrawerSlider);
      const swiperSlider = new Swiper(slider, {
        centeredSlides: true,
        slidesPerView: 1.5,
        spaceBetween: 15,
        lazy: {
          enabled: true,
          loadPrevNextAmount: 2,
          checkInView: true,
        },
      })
      this.drawerList[i].slider = swiperSlider;
    })
  }
}
