import $ from 'jquery'; // eslint-disable-line no-unused-vars
import Swiper from 'swiper';
import BaseSection from './base';

const selectors = {
  slider: '[data-slider]',
  slide: '[data-slide]',
  mktDrawerTrigger: '[data-toggle-mkt-drawer]',
  image: '[data-image]',
};

export default class LinkCardSlider extends BaseSection {
  constructor(container) {
    super(container, 'footer');
    this.newsletterForm = $(selectors.newsletterForm, this.$container);

    this.$slider = $(selectors.slider, this.$container);
    this.$slides = $(selectors.slide, this.$container);
    this.$mktDrawerTrigger = $(selectors.mktDrawerTrigger, this.$container);

    this.initSliders();
    this.$mktDrawerTrigger.on('click', this.toggleMktDrawer.bind(this));
  };

  initSliders() {
    this.slider = new Swiper(this.$slider, {
      slidesPerView: 1.3,
      spaceBetween: 20,
      slidesOffsetBefore: 30,
      slidesOffsetAfter: 30,
      watchOverflow: true,
      threshold: 10,
      lazy: {
        enabled: true,
        loadPrevNext: true,
        loadPrevNextAmount: 2,
      },
      navigation: {
        nextEl: '[data-arrow-next]',
        prevEl: '[data-arrow-prev]'
      },
      breakpoints: {
        530: {
          slidesPerView: 2.3,
        },
        992: {
          slidesPerView: 3.3,
          slidesOffsetBefore: 50,
          slidesOffsetAfter: 50,
        },
        1400: {
          slidesPerView: 4.3,
          slidesOffsetBefore: 50,
          slidesOffsetAfter: 50,
        }
      }
    });
  }

  toggleMktDrawer(e) {
    e.preventDefault();

    const $link = $(e.currentTarget);
    const drawerData = this.buildDrawerData($link);

    $(window).trigger($.Event('marketing-drawer:open', {drawerData}));
  }

  buildDrawerData($link) {
    const image = $(selectors.image, $link.parents(selectors.slide)).attr('src');
    const data = {
      productName: $link.data('product-name'),
      image: image,
    }

    return data;
  }

  onBlockSelect(evt) {
    this.slider.slideTo($(evt.target).index());
  }
}
