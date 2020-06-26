import $ from 'jquery';
import * as Utils from '../core/utils';

const $document = $(document);
const $body = $(document.body);

const selectors = {
  close: '[data-drawer-close]'
};

const classes = {
  drawer: 'drawer',
  visible: 'is-visible',
  backdrop: 'drawer-backdrop',
  backdropVisible: 'is-visible',
  bodyDrawerOpen: 'drawer-open'
};

export default class Drawer {
  /**
   * Drawer constructor
   *
   * @param {HTMLElement | $} el - The drawer element
   * @param {Object} options
   */
  constructor(el, options) {
    this.name = 'drawer';
    this.namespace = `.${this.name}`;

    this.$el = $(el);
    this.stateIsOpen            = false;
    this.transitionEndEvent     = Utils.whichTransitionEnd();
    this.supportsCssTransitions = !!Modernizr.csstransitions;

    if (this.$el === undefined || !this.$el.hasClass(classes.drawer)) {
      console.warn(`[${this.name}] - Element with class ${classes.drawer} required to initialize.`);
      return;
    }

    const defaults = {
      closeSelector: selectors.close,
      backdrop: true
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

  addBackdrop(callback) {
    const cb = callback || $.noop;

    if (this.stateIsOpen) {
      this.$backdrop = $(document.createElement('div'));

      this.$backdrop.addClass(classes.backdrop).appendTo($body);

      this.$backdrop.one(this.transitionEndEvent, cb);
      this.$backdrop.one('click', this.hide.bind(this));

      // debug this...
      setTimeout(() => {
        $body.addClass(classes.bodyDrawerOpen);
        this.$backdrop.addClass(classes.backdropVisible);
      }, 10);
    }
    else {
      cb();
    }
  }

  removeBackdrop(callback) {
    const cb = callback || $.noop;

    if (this.$backdrop) {
      this.$backdrop.one(this.transitionEndEvent, () => {
        this.$backdrop && this.$backdrop.remove();
        this.$backdrop = null;
        cb();
      });

      setTimeout(() => {
        this.$backdrop.removeClass(classes.backdropVisible);
        $body.removeClass(classes.bodyDrawerOpen);
      }, 10);
    }
    else {
      cb();
    }
  }
  
  /**
   * Called after the closing animation has run
   */    
  onHidden() {
    this.stateIsOpen = false;
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

    this.$el.removeClass(classes.visible);

    if (this.settings.backdrop) {
      this.removeBackdrop();
    }

    this.$el.find(".drawer__header-title").removeClass("in");

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
    if (this.settings.backdrop) {
      this.addBackdrop();
    }
    
    this.$el.find(".drawer__header-title").addClass("in");

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

// Data API
$document.on('click.drawer', '[data-toggle="drawer"]', function(e) {
  const $this   = $(this);
  const $target = $($this.attr('data-target'));
  const options = $.extend($target.data(), $this.data());
  let data      = $this.data('drawer');

  if ($this.is('a')) e.preventDefault();

  if (!data) {
    $this.data('drawer', (data = new Drawer($target, options)));
    data.show();
  }
  else {
    data.toggle();
  }
});
