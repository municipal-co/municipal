import $ from 'jquery';
import * as Utils from '../core/utils';

const $document = $(document);

const selectors = {
  close: '[data-slideup-close]'
};

const classes = {
  slideup: 'slideup',
  visible: 'is-visible'
};

export default class Slideup {
  /**
   * Slideup constructor
   *
   * @param {HTMLElement | $} el - The slideup element
   * @param {Object} options
   */  
  constructor(el, options) {
    this.name = 'slideup';
    this.namespace = `.${this.name}`;

    this.$el = $(el);
    this.stateIsOpen            = false;
    this.transitionEndEvent     = Utils.whichTransitionEnd();
    this.supportsCssTransitions = !!Modernizr.csstransitions;

    if (this.$el === undefined || !this.$el.hasClass(classes.slideup)) {
      console.warn(`[${this.name}] - Element with class ${classes.slideup} required to initialize.`);
      return;
    }

    const defaults = {
      closeSelector: selectors.close
    };

    this.settings = $.extend({}, defaults, options);

    this.events = {
      HIDE:   'hide'   + this.namespace,
      HIDDEN: 'hidden' + this.namespace,
      SHOW:   'show'   + this.namespace,
      SHOWN:  'shown'  + this.namespace
    };

    this.$el.on('click', this.settings.closeSelector, this.onCloseClick.bind(this));
  }

  /**
   * Called after the closing animation has run
   */    
  onHidden() {
    const e = $.Event(this.events.HIDDEN);
    this.$el.trigger(e);
  }

  /**
   * Called after the opening animation has run
   */
  onShown() {
    const e = $.Event(this.events.SHOWN);
    this.$el.trigger(e);
  }

  hide() {
    const e = $.Event(this.events.HIDE);
    this.$el.trigger(e);

    if (!this.stateIsOpen) return;

    this.stateIsOpen = false;

    this.$el.removeClass(classes.visible);

    if (this.supportsCssTransitions) {
      this.$el.one(this.transitionEndEvent, this.onHidden.bind(this));
    }
    else {
      this.onHidden();
    }
  }

  show() {
    const e = $.Event(this.events.SHOW);
    this.$el.trigger(e);

    if (this.stateIsOpen) return;

    this.stateIsOpen = true;

    this.$el.addClass(classes.visible);

    if (this.supportsCssTransitions) {
      this.$el.one(this.transitionEndEvent, this.onShown.bind(this));
    }
    else {
      this.onShown();
    }
  }

  toggle() {
    return this.stateIsOpen ? this.hide() : this.show();
  }

  onCloseClick(e) {
    e.preventDefault();
    this.hide();
  }
}

$document.on('click.slideup', '[data-toggle="slideup"]', function(e) {
  const $this   = $(this);
  const $target = $($this.attr('data-target'));
  const options = $.extend($target.data(), $this.data());
  let data      = $this.data('slideup');

  if ($this.is('a')) e.preventDefault();

  if (!data) {
    $this.data('slideup', (data = new Slideup($target, options)));
    data.show();
  }
  else {
    data.toggle();
  }
});
