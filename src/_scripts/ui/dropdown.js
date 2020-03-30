import $ from 'jquery';

const classes = {
  open: 'is-open',
  forcedOpen: 'is-forced-open'
};

export default class Dropdown {
  constructor($trigger) {
    this.$trigger = $trigger;
    this.$el      = $(this.$trigger.data('dropdown-trigger'));
    this.blockId  = this.$trigger.data('block').toString();
  }

  isOpen() {
    return this.$el.hasClass(classes.open);
  }

  open() {
    this.$el.addClass(classes.open);
  }

  close() {
    this.$el.removeClass(classes.open);
  }

  /**
   * Dropdown manager doesn't use the forced open class
   * So we can use it in conjunction with the theme editor to ensure dropdowns are open while editing
   */
  forceOpen() {
    this.$el.addClass(classes.forcedOpen);
  }

  forceClose() {
    this.$el.removeClass(classes.forcedOpen);
  }
}
