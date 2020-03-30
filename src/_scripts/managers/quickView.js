import $ from 'jquery';
import { throttle } from 'throttle-debounce';
import QuickView from '../view/product/quickView';
import * as Animations from '../core/animations';

const $window = $(window);

const selectors = {
  productCard: '[data-product-card]'
};

class QuickViewManager {
  constructor() {
    this.name = 'quickViewManager';
    this.quickViews = [];
    this.loading = false;

    $window.on('resize', throttle(50, this.onResize.bind(this)));
  }

  register(qv) {
    if (!(qv instanceof QuickView)) {
      console.warn('['+this.name+'] - instance of QuickView required when calling register');
      return;
    }

    this.quickViews.push(qv);
  }

  getQuickViewByProductCard($productCard) {
    let foundQV;

    $.each(this.quickViews, (i, qv) => { // eslint-disable-line
      if (qv.$productCard.is($productCard)) {
        foundQV = qv;
        return false;
      }
    });

    return foundQV;
  }

  onResize() {
    $.each(this.quickViews, (i, qv) => {
      qv.onResize();
    });
  }

  getOpenQuickViews() {
    const opens = [];

    $.each(this.quickViews, (i, qv) => {
      qv.isOpen() && opens.push(qv);
    });

    return opens;
  }

  closeOpenQuickViews(cb) {
    const opens = this.getOpenQuickViews();

    if (opens.length === 0) {
      cb();
    }
    else {
      $.each(opens, (i, qv) => {
        if (i  === 0) {
          qv.$productCard.one('closed.quickView', cb);
        }
        qv.close();
      });
    }
  }

  onQuickViewTriggerClick($trigger) {
    if ($trigger === undefined) {
      return;
    }

    const $productCard   = $trigger.parents(selectors.productCard);
    let quickView        = this.getQuickViewByProductCard($productCard);
    const triggerText    = $trigger.text(); // Cache this text so we can set it as loading

    if (quickView === undefined) {
      if (this.loading) return; // Return early, we're already fetching a quick view, sorry!

      this.loading = true;

      $trigger.text('Loading');

      // generate a new QV
      quickView = new QuickView({
        $productCard: $productCard,
        url: $trigger.attr('href'),
        transitionDuration: Animations.getTransitionTimingDuration('slow'),
        transitionTimingFunction: Animations.getTransitionTimingFunction('inOutUI')
      });

      $productCard.one('loaded.quickView', () => {
        this.loading = false;
        $trigger.text(triggerText); // Return the button to it's original state
        this.closeOpenQuickViews(quickView.open.bind(quickView)); // Make sure all the QVs are closed before opening this new one
      });

      this.register(quickView);
    }
    else if (!quickView.isOpen()) {
      this.closeOpenQuickViews(quickView.open.bind(quickView));
    }
  }
}

export default new QuickViewManager();
