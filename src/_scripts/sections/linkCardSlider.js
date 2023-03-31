import $ from 'jquery'; // eslint-disable-line no-unused-vars
import BaseSection from './base';
import ScrollSnapSlider from '../managers/scrollSnapSlider';

const selectors = {
  mktDrawerTrigger: '[data-toggle-mkt-drawer]',
  mentorDrawerTrigger: '[data-toggle-mentor-drawer]',
  image: '[data-image]',
};

export default class LinkCardSlider extends BaseSection {
  constructor(container) {
    super(container, 'linkCardSlider');
    this.newsletterForm = $(selectors.newsletterForm, this.$container);

    this.$mktDrawerTrigger = $(selectors.mktDrawerTrigger, this.$container);
    this.$mentorDrawerTrigger = $(selectors.mentorDrawerTrigger, this.$container);
    this.$mktDrawerTrigger.on('click', this.toggleMktDrawer.bind(this));
    this.$mentorDrawerTrigger.on('click', this.toggleMentorDrawer.bind(this));

    this.slider = new ScrollSnapSlider(this.$container.get(0), {
      nextArrow: '[data-arrow-next]',
      prevArrow: '[data-arrow-prev]',
      enableArrows: true,
      slidesPerView: 1.2,
      paddingBefore: '30px',
      paddingAfter: '30px',
      breakpoints: {
        768: {
          paddingBefore: '30px',
          paddingAfter: '30px',
          slidesPerView: 2.5,
        },
        992: {
          paddingBefore: '50px',
          paddingAfter: '50px',
          slidesPerView: 3.5
        },
        1200: {
          slidesPerView: 4.3,
        }
      }
    })
  };

  toggleMktDrawer(e) {
    e.preventDefault();

    const $link = $(e.currentTarget);
    const drawerData = this.buildDrawerData($link);

    $(window).trigger($.Event('marketing-drawer:open', {drawerData}));
  }

  toggleMentorDrawer(e) {
    e.preventDefault();
    const $target = e.target;
    const mentorsData = $target.dataset.mentorsInfo;
    const mentorId = $target.dataset.mentorId;

    document.dispatchEvent(new CustomEvent('drawer-open:mentor', { detail: {
      mentorsData,
      mentorId
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
    this.$sliderContainer.slideTo($(evt.target).index());
  }
}
