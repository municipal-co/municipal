import $ from 'jquery';
import Handlebars from 'handlebars';
import Slideup from './slideup';

/**
 * Slideup Alert
 * ------------------------------------------------------------------------------
 *
 * Requires:
 *  - snippets/slideup-template.liquid
 *
 * @namespace - slideupAlert
*/

const $body = $(document.body);

const selectors = {
  template: 'script[data-slideup-template]'
};

export default class SlideupAlert {
  /**
   * Slideup Alert constructor
   *
   * @param {Object} options
   * @param {String} options.title - Title text of the slideup
   * @param {String} options.text - Body text of the slideup
   * @param {Integer} options.timeoutDuration - How long to display the alert before closing automatically (in ms)
   */
  constructor(options) {
    this.name = 'slideupAlert';
    this.namespace = '.'+this.name;

    if ($(selectors.template).length === 0) {
      console.warn(`[${this.name}] - Handlebars template required to initialize`);
      return;
    }

    const template = Handlebars.compile($(selectors.template).html());
    const defaults = {
      title: null,
      text: null,
      timeoutDuration: 5000
    };
    
    this.settings = $.extend({}, defaults, options);
    this.interactionTimeout = false;

    this.$el = $(template(this.settings));

    this.$el.appendTo($body);

    this.$el.on('shown.slideup', this.onShown.bind(this));
    this.$el.on('hidden.slideup', this.onHidden.bind(this));
    this.$el.on('mouseenter', this.onMouseenter.bind(this));
    this.$el.on('mouseleave', this.onMouseleave.bind(this));

    this.slideup = new Slideup(this.$el);

    setTimeout(() => {
      this.slideup.show();
    }, 10);
  }

  setInteractionTimeout() {
    this.interactionTimeout = setTimeout(() => {
      this.slideup.hide();
    }, this.settings.timeoutDuration);
  }

  clearInteractionTimeout() {
    clearTimeout(this.interactionTimeout);
  }

  onMouseenter() {
    this.clearInteractionTimeout();
  }

  onMouseleave() {
    this.setInteractionTimeout();
  }

  onHidden() {
    this.clearInteractionTimeout();
    this.$el.remove();
  }

  onShown() {
    this.setInteractionTimeout();
  }
}
