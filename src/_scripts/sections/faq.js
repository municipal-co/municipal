import $ from 'jquery'; // eslint-disable-line no-unused-vars
import BaseSection from './base';

const selectors = {
  accordions: '[data-accordions]',
  accordionGroup: '[data-accordion-group]',
  accordion: '[data-accordion]',
  toggle: '[data-accordion-toggle]'
};

const classes = {
  toggle: 'is-open'
};

export default class Faq extends BaseSection {
  constructor(container) {
    super(container, 'faq');

    // Smooth scrolling
    if ($('body').hasClass('template-page-faq')) {
      $('html').css('scroll-behavior', 'smooth');
    }

    $(selectors.accordions).on('click', selectors.toggle, (e) => {
      e.preventDefault();

      const $this = $(e.currentTarget);

      // Close other accordions in group
      $this
        .closest(selectors.accordionGroup)
        .find(selectors.accordion)
        .not($this.closest(selectors.accordion))
        .removeClass(classes.toggle)
        .find(selectors.toggle)
        .attr('aria-expanded', false);

      // Toggle clicked accordion
      let ariaState = ($this.attr('aria-expanded') === 'true');
      $this
        .attr('aria-expanded', !ariaState)
        .closest(selectors.accordion)
        .toggleClass(classes.toggle);
    });
  }
}
