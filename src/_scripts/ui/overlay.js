import $ from 'jquery';
import * as Utils from '../core/utils';

const $document = $(document);
const $body = $(document.body);

const selectors = {
  close: '[data-overlay-close]'
};

const classes = {
  overlay: 'overlay',
  visible: 'is-visible',
  bodyOverlayOpen: 'overlay-open'
};

export default class Overlay {
  /**
   * Overlay constructor
   *
   * @param {HTMLElement | $} el - The overlay element
   * @param {Object} options
   */  
  constructor(el, options) {
    this.name = 'overlay';
    this.namespace = `.${this.name}`;

    this.$el = $(el);
    this.stateIsOpen            = false;
    this.transitionEndEvent     = Utils.whichTransitionEnd();
    this.supportsCssTransitions = !!Modernizr.csstransitions;

    if (this.$el === undefined || !this.$el.hasClass(classes.overlay)) {
      console.warn(`[${this.name}] - Element with class ${classes.overlay} required to initialize.`);
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
      SHOWN:  'shown'  + this.namespace,
      FOCUS:  'focus'  + this.namespace,
      KEYDOWN_DISMISS: 'keydown.dismiss' + this.namespace
    };

    this.$el.on('click', this.settings.closeSelector, this.onCloseClick.bind(this));
  }

  /**
   * Called after the closing animation has run
   */    
  onHidden() {
    $body.removeClass(classes.bodyOverlayOpen);

    const e = $.Event(this.events.HIDDEN);
    this.$el.trigger(e);
  }

  /**
   * Called after the opening animation has run
   */
  onShown() {
    this.enforceFocus();

    const e = $.Event(this.events.SHOWN);
    this.$el.trigger(e);
    this.$el.trigger('focus');
  }

  hide() {
    const e = $.Event(this.events.HIDE);
    this.$el.trigger(e);

    if (!this.stateIsOpen) return;

    this.stateIsOpen = false;

    this.updateEscapeHandler();

    $document.off(this.events.FOCUS);

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

    this.updateEscapeHandler();

    $body.addClass(classes.bodyOverlayOpen);
    this.$el.addClass(classes.visible);

    if (this.supportsCssTransitions) {
      this.$el.one(this.transitionEndEvent, this.onShown.bind(this));
    }
    else {
      this.onShown();
    }
  }

  enforceFocus() {
    $document.off(this.events.FOCUS);
    $document.on(this.events.FOCUS, $.proxy(function(e) {
      if (document !== e.target && this.$element[0] !== e.target && !this.$element.has(e.target).length) {
        this.$el.trigger('focus');
      }
    }, this));
  }

  updateEscapeHandler() {
    if (this.stateIsOpen) {
      this.$el.on(this.events.KEYDOWN_DISMISS, $.proxy(function(e) {
        e.which === 27 && this.hide();
      }, this));
    }
    else {
      this.$el.off(this.events.KEYDOWN_DISMISS);
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

// Data API
$document.on('click.overlay', '[data-toggle="overlay"]', function(e) {
  const $this   = $(this);
  const $target = $($this.attr('data-target'));
  const options = $.extend($target.data(), $this.data());
  let data      = $this.data('overlay');

  if ($this.is('a')) e.preventDefault();

  if (!data) {
    $this.data('overlay', (data = new Overlay($target, options)));
    data.show();
  }
  else {
    data.toggle();
  }
});
