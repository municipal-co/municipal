import $ from 'jquery'; // eslint-disable-line no-unused-vars
import Swiper, { Navigation, Scrollbar, Lazy } from 'swiper';
import BaseSection from './base';

const selectors = {
  slider: '[data-slider]',
  slide: '[data-slide]',
  mktDrawerTrigger: '[data-toggle-mkt-drawer]',
  mentorDrawerTrigger: '[data-toggle-mentor-drawer]',
  scrollBar: '[data-scrollbar]',
  image: '.link-card__image',
};

export default class LinkCardSlider extends BaseSection {
  constructor(container) {
    super(container, 'linkCardSlider');
    this.newsletterForm = $(selectors.newsletterForm, this.$container);

    this.$slider = $(selectors.slider, this.$container);
    this.$slides = $(selectors.slide, this.$container);
    this.$scrollBar = $(selectors.scrollBar, this.$container);
    this.$mktDrawerTrigger = $(selectors.mktDrawerTrigger, this.$container);
    this.$mentorDrawerTrigger = $(selectors.mentorDrawerTrigger, this.$container);
    this.initSliders();
    this.$mktDrawerTrigger.on('click', this.toggleMktDrawer.bind(this));
    this.$mentorDrawerTrigger.on('click', this.toggleMentorDrawer.bind(this));
  };

  initSliders() {
    this.slider = new Swiper(this.$slider.get(0), {
      modules: [ Navigation, Scrollbar, Lazy ],
      slidesPerView: 1.3,
      spaceBetween: 20,
      slidesOffsetBefore: 30,
      slidesOffsetAfter: 30,
      watchOverflow: true,
      threshold: 10,
      scrollbar: this.$slides.length <= 4 ? false : {
        el: this.$scrollBar.get(0),
        draggable: true,
      },
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

    document.dispatchEvent(new CustomEvent('drawerOpen', {detail: {
      type: 'marketing-drawer',
      ...drawerData
    }}))
  }

  toggleMentorDrawer(e) {
    e.preventDefault();
    const $target = e.target;
    const mentorsData = $target.dataset.mentorsInfo;
    const mentorId = $target.dataset.mentorId;

    document.dispatchEvent(new CustomEvent('drawerOpen', { detail: {
      type: 'mentor-drawer',
      mentorsData: JSON.parse(mentorsData),
      mentorId: mentorId
    }}))
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
