import $ from 'jquery';
import { throttle } from 'throttle-debounce';
import * as Utils from '../core/utils';

const $document = $(document);

const selectors = {
  tabsContainer: '.tabs-container',
  tabsListWrapper: '.tabs-list-wrapper',
  tabsList: '.tabs-list',
  tab: '.tab',
  tabsPanelsWrapper: '.tabs-panels-wrapper',
  tabPanel: '.tab-panel'
};

const classes = {
  tabActive: 'is-active',
  tabPanelActive: 'is-active'
};

export default class Tabs {
  /**
   * Tabs constructor
   *
   * @param {HTMLElement | $} el - Element containing the tab elements
   * @param {Object} options - Options passed into the slider initialize function
   */  
  constructor(el, options) {
    const $el = $(el);

    this.name = 'tabs';
    this.namespace = `.${this.name}`;

    this.events = {
      HIDDEN: 'hidden' + this.namespace,
      HIDE:   'hide'   + this.namespace,
      SHOW:   'show'   + this.namespace,
      SHOWN:  'shown'  + this.namespace
    };
 
    this.animationDuration      = 300; // For emulating transitions where transitionevents aren't supports
    this.transitionEndEvent     = Utils.whichTransitionEnd();
    this.supportsCssTransitions = !!Modernizr.csstransitions;
    this.isAnimating            = false;

    if (!$el.length || !$el.is(selectors.tabsContainer)) {
      console.warn(`[${this.name}] - Tabs container element required to initialize`);
      return;
    }

    this.$el                = $el;
    this.$tabs              = $(selectors.tab, this.$el);
    this.$tabsList          = $(selectors.tabsList, this.$el);
    this.$tabsListWrapper   = $(selectors.tabsListWrapper, this.$el);
    this.$tabPanels         = $(selectors.tabPanel, this.$el);
    this.$tabsPanelsWrapper = $(selectors.tabsPanelsWrapper, this.$el);
    this.$activeTab         = this.$tabs.filter('.' + classes.tabActive); // Keep track of the active elements
    this.$activeTabPanel    = this.$tabPanels.filter('.' + classes.tabPanelActive); // Keep track of the active elements

    // START required elements check
    const requiredEls = 'tabs tabsList tabsListWrapper tabPanels tabsPanelsWrapper'.split(' ');
    const missingEls = [];

    for (let i = 0; i < requiredEls.length; i++) {
      const element = requiredEls[i];
      if (this['$'+element].length === 0) {
        missingEls.push(element);
        console.warn(`[${this.name}] - "this.$${element}" element required to initialize`);
      }
    }
    
    if (missingEls.length > 0) return;
    // END requirements check

    this.setTabsPanelsWrapperHeight();

    this.$el.on('click', selectors.tab, this.onTabClick.bind(this));

    // If no active tab, activate the first one
    if (this.$activeTab.length === 0) {
      this.activate(this.$tabs.first());
    }

    $(window).on('resize', throttle(100, this.onResize.bind(this)));
  }

  onResize() {
    this.setTabsPanelsWrapperHeight();
  }

  // Resize tabspanels to max height of the largest panel 
  setTabsPanelsWrapperHeight() {
    const heights = [];
    this.$tabPanels.each((i, el) => {
      heights.push(el.offsetHeight);
    });
    this.$tabsPanelsWrapper.css('height', Math.max.apply(null, heights));
  }
  
  activate($tab) {
    if (!$tab || $tab.length === 0 || $tab.hasClass(classes.tabActive) || $tab.is(this.$activeTab) || this.isAnimating) return;

    // Tabs
    if (this.$activeTab && this.$activeTab.length) {
      this.$activeTab.removeClass(classes.tabActive);
      this.$activeTab.attr('role') === 'tab' && this.$activeTab.attr('aria-selected', false);
    }

    $tab.addClass(classes.tabActive);
    $tab.attr('role') === 'tab' && $tab.attr('aria-selected', true);

    // Tab Panels
    const $tabPanel = $($tab.attr('href'));

    // Initial callback that happens once the active panel is fully hidden
    const cb = () => {
      if (this.$activeTabPanel) {
        this.$el.trigger($.Event(this.events.HIDDEN, { relatedTarget: this.$activeTabPanel.get(0) }));
      }
      
      this.$el.trigger($.Event(this.events.SHOW, { relatedTarget: $tabPanel.get(0) }));
      $tabPanel.addClass(classes.tabPanelActive);

      // Update active element variables
      this.$activeTab      = $tab;
      this.$activeTabPanel = $tabPanel;

      // Secondary callback that happens once the newly active panel is fully visible
      const cb2 = () => {
        this.$el.trigger($.Event(this.events.SHOWN, { relatedTarget: $tabPanel.get(0) }));
        this.isAnimating = false;
      };

      if (this.supportsCssTransitions) {
        this.$activeTabPanel.one(this.transitionEndEvent, cb2);
      }
      else {
        setTimeout(cb2, this.animationDuration);
      }
    };

    if (this.$activeTabPanel && this.$activeTabPanel.length) {
      this.$el.trigger($.Event(this.events.HIDE, { relatedTarget: this.$activeTabPanel.get(0) }));
      this.$activeTabPanel.removeClass(classes.tabPanelActive);
      this.isAnimating = true;

      if (this.supportsCssTransitions) {
        this.$activeTabPanel.one(this.transitionEndEvent, cb);
      }
      else {
        setTimeout(cb, this.animationDuration);
      }
    }
    // No active panel, just run the callback
    else {
      cb();
    }
  }

  // Only used by the theme editor to reset everything
  deactivate() {
    this.$tabs.removeClass(classes.tabActive);
    this.$tabPanels.removeClass(classes.tabPanelActive);
    this.$activeTab = undefined;
    this.$activeTabPanel = undefined;
    this.isAnimating = false;
  }

  onTabClick(e) {
    e.preventDefault();
    this.activate($(e.currentTarget));
  }
}

$document.on('click.tabs', '[data-toggle="tab"]', function(e) {
  e.preventDefault();

  const $this      = $(this);
  const $container = $this.parents(selectors.tabsContainer);
  let data         = $container.data('tabs');

  if (!data) {
    data = new Tabs($container);
    $container.data('tabs', data);
    data.activate($(e.currentTarget));
  }
});
