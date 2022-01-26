import $ from 'jquery'; // eslint-disable-line no-unused-vars
import BaseSection from './base';

const selectors = {
  yotpoReviews: '.yotpo-reviews',
  yotpoReview: '.yotpo-review',
  starReviews: '#yotpo-star-reviews',
  yotpoHeaderElement: '.yotpo-header-element',
  dateOriginalLocation: '.yotpo-header-element.yotpo-header-actions .yotpo-review-date',
  productStickyBar: '.product__sticky-bar',
  header: '.header'
}

const classes = {
  yotpoLoaded: 'yotpo-loaded'
}

const templates = {
  sizeFitTemplate: (value) => {
    return `<div class="yotpo-user-field size-fit-field modified-field" data-type="SingleValue">
      <span class="yotpo-user-field-description text-s">Size Fit:</span>
      <span class="yotpo-user-field-answer text-s">` + value + `</span>
    </div>`
  },
  dateTemplate: (value) => {
    return `<div class="yotpo-user-field" data-type="SingleChoice">
      <span class="yotpo-user-field-description text-s">Date:</span>
      <span class="yotpo-user-field-answer text-s">` + value + `</span>
    </div>`
  },
  nameTemplate: (value) => {
    return `<div>
      <span class="y-label yotpo-user-name yotpo-font-bold pull-left" aria-level="3">` + value + `</span>
    </div>`
  },
  verifiedTemplate:
    `<div class="label-with-tooltip pull-left" aria-level="3">
      <span class="y-label yotpo-user-title yotpo-action-hover" data-type="toggleFade" data-target="yotpo-tool-tip" aria-describedby="179043713">Verified Reviewer</span>
    </div>`
}

export default class YotpoReviews extends BaseSection {
  constructor(container) {
    super(container, 'yotpo-reviews');

    this.$container = $(container);
    this.observerProperties = {
      root: null,
      rootMargin: '0% 0% -20% 0%',
      threshold: 0.1
    };
    this.makeOnceTheFormatting = true;

    const containerThis = this;
    /**
     * Yotpo Reviews
     * Format all Yotpo Baseline Reviews as stars + review count, ex: '***** (3)'
     * as soon as Yotpo's loaded.  Set a yotpo 'ready' handler to reformat them
     * each time the widgets are reloaded.
     */
    const limit = 20; // if yotpo hasn't loaded after 20 checks, bail.
    let isLoading = true;
    let count = 0;
    const yotpoReadyCallback = () => {
      $(selectors.starReviews).addClass(classes.yotpoLoaded);

      this.formatSizingMessages(false);

      function mutationHandler(mutationRecords) {
        mutationRecords.forEach(function(mutation) {
          containerThis.makeOnceTheFormatting = true;

          mutation.addedNodes.forEach(function(singleNode) {
            if ($(singleNode).is(selectors.yotpoReview) && containerThis.makeOnceTheFormatting) {
              containerThis.formatSizingMessages(true);

              const productStyickyBarHeight = $(selectors.productStickyBar).outerHeight();
              const headerHeight = $(selectors.header).outerHeight();
              const topSeparation = productStyickyBarHeight + headerHeight;

              $('html, body').animate({
                scrollTop: $(selectors.yotpoReviews).offset().top - topSeparation
              }, 500);

              containerThis.makeOnceTheFormatting = false;
            }
          });
        });
      }

      const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
      const myObserver = new MutationObserver(mutationHandler);
      const obsConfig = { childList: true, characterData: true, attributes: true, subtree: true };

      $(selectors.yotpoReviews).each(function() {
        myObserver.observe(this, obsConfig);
      });

    };
    const yotpoCheck = setInterval(() => {
      if (typeof window.yotpo !== 'undefined') {
        if (isLoading) {
          window.yotpo.refreshWidgets();
          isLoading = false;
        }
        if (window.yotpo.getState() === 'ready') {
          window.yotpo.refreshWidgets();

          yotpoReadyCallback();
        }
        // Yotpo emits the ready event anytime yotpo.refreshWidgets()
        // is called, so set this up to re-execute each time going forward
        // eslint-disable-next-line no-undef
        yotpo.on('ready', yotpoReadyCallback);
        // Clear the interval
        clearInterval(yotpoCheck);
      } else {
        count++;
        if (count >= limit) {
          clearInterval(yotpoCheck);
        }
      }
    }, 800);

    this.IntersectionObserver = new IntersectionObserver(this.observerCallback.bind(this), this.observerProperties);
    this.IntersectionObserver.observe(this.$container.get(0));
  }

  formatSizingMessages(isAddingNewReview) {
    const $yotpoWrapper = this.$container;

    const $yotpoSizesLabels = $yotpoWrapper.find('.yotpo-size-field-titles label');

    const sizesValues = [];

    $.each($yotpoSizesLabels, function() {
      const value = $(this).text();
      sizesValues.push(value);
    });
    sizesValues.splice(1, 0, '');
    sizesValues.splice(3, 0, '');

    const $yotpoReviews = $yotpoWrapper.find(selectors.yotpoReview).not('.yotpo-hidden');

    $.each($yotpoReviews, function() {
      const $this = $(this);

      const $firstHeaderElement = $this.find(selectors.yotpoHeaderElement).not('.yotpo-icon-profile').first();
      const $userFields = $firstHeaderElement.find('.yotpo-user-related-fields');

      let yotpoFitSizeVal = $this.find('.product-related-fields-item[data-type="Size"] .product-related-fields-item-value').eq(0).text();

      if ($userFields.children('.modified-field').length) {
        return;
      }

      if (isAddingNewReview) {
        yotpoFitSizeVal = $this.find('.product-related-fields-item[data-type="Size"] .product-related-fields-item-value').eq(0).text();
      }


      $userFields.prepend(templates.sizeFitTemplate(yotpoFitSizeVal));

      const dateValue = $this.find(selectors.dateOriginalLocation).first().text();

      $userFields.prepend(templates.dateTemplate(dateValue));

      const nameValue = $firstHeaderElement.find('.yotpo-user-name').text();

      $userFields.prepend(templates.nameTemplate(nameValue));

      const $verifiedLabel = $firstHeaderElement.find('.label-with-tooltip');

      if ($verifiedLabel.length && !$verifiedLabel.hasClass('yotpo-hidden')) {
        $userFields.prepend(templates.verifiedTemplate);
      }

      const $lastUserField = $userFields.find('.yotpo-user-field').last();
      const $recommendDescription = $lastUserField.find('.yotpo-user-field-description');
      const $recommendAnswer = $lastUserField.find('.yotpo-user-field-answer');

      $lastUserField.addClass('recommend-field');
      $recommendDescription.text($recommendDescription.text().replace(' to a Friend', ''));

      if ($recommendAnswer.text() === 'Yes') {
        $recommendAnswer.text($recommendAnswer.text().replace('Yes', 'Yes 👍'));
      } else {
        $recommendAnswer.text($recommendAnswer.text().replace('No', 'No ❌'));
      }
    });
  }

  observerCallback(entries, observer) {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0.1) {

        const event = $.Event('moduleInView', { selector: '#' + this.$container.attr('id') });

        $('body').trigger(event);
      }
    })
  }
}
