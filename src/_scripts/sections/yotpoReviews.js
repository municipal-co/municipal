import $ from 'jquery'; // eslint-disable-line no-unused-vars
import BaseSection from './base';

const templates = {
  sizeFitTemplate: (label, value) => {
    return `<div class="yotpo-user-field size-fit-field modified-field" data-type="SingleChoice">
      <span class="yotpo-user-field-description text-s">` + label + `</span>
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

    const containerThis = this;
    /**
     * Yotpo Reviews
     * Format all Yotpo Baseline Reviews as stars + review count, ex: '***** (3)'
     * as soon as Yotpo's loaded.  Set a yotpo 'ready' handler to reformat them
     * each time the widgets are reloaded.
     */
    const limit = 20; // if yotpo hasn't loaded after 20 checks, bail.
    let count = 0;
    const yotpoReadyCallback = () => {
      this.formatSizingMessages(false);

      function mutationHandler(mutationRecords) {
        mutationRecords.forEach(function(mutation) {
          if ($(mutation.addedNodes[0]).is('.yotpo-review')) {
            containerThis.formatSizingMessages(true);
          }
        });
      }

      const yotpoReviews = $('.yotpo-reviews');
      const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
      const myObserver = new MutationObserver(mutationHandler);
      const obsConfig = { childList: true, characterData: true, attributes: true, subtree: true };

      yotpoReviews.each(function() {
        myObserver.observe(this, obsConfig);
      });

    };
    const yotpoCheck = setInterval(() => {
      if (typeof yotpo !== 'undefined') {
        // eslint-disable-next-line no-undef
        if (yotpo.getState() === 'ready') {
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
    }, 500);

    this.IntersectionObserver = new IntersectionObserver(this.observerCallback.bind(this), this.observerProperties);
    this.IntersectionObserver.observe(this.$container.get(0));
  }

  formatSizingMessages(isAddingNewReview) {
    const $yotpoWrapper = this.$container;

    const $sizeFitFieldName = $yotpoWrapper.find('.yotpo-bottomline-box-2 .yotpo-product-related-field-name').text();

    const $yotpoSizesLabels = $yotpoWrapper.find('.yotpo-size-field-titles label');

    const sizesValues = [];

    $.each($yotpoSizesLabels, function() {
      const value = $(this).text();
      sizesValues.push(value);
    });
    sizesValues.splice(1, 0, '');
    sizesValues.splice(3, 0, '');

    const $yotpoReviewsContainer = $yotpoWrapper.find('.yotpo-reviews');
    const $yotpoReviews = $yotpoReviewsContainer.find('.yotpo-review').not('.yotpo-hidden');

    $.each($yotpoReviews, function() {
      const $this = $(this);

      const $firstHeaderElement = $this.find('.yotpo-header-element').not('.yotpo-icon-profile').first();
      const $userFields = $firstHeaderElement.find('.yotpo-user-related-fields');

      const $yotpoReviewsColumn = $this.find('.yotpo-product-related-fields-column:first-child');
      let $yotpoReviewsBars = $yotpoReviewsColumn.find('.yotpo-product-related-fields-bars > .yotpo-field-bars-container > .yotpo-size-bars');

      if ($userFields.children('.modified-field').length) {
        return;
      }

      if (isAddingNewReview) {
        $yotpoReviewsBars = $yotpoReviewsColumn.find('.yotpo-product-related-fields-bars > .yotpo-size-bars');
      }

      const $yotpoSingleBar = $yotpoReviewsBars.find('.yotpo-product-related-field-score-bar');

      let sizeFitValue = '';

      $.each($yotpoSingleBar, function(barIndex) {
        if (!$(this).hasClass('yotpo-size-bar-empty')) {
          sizeFitValue = sizesValues[barIndex];
        }
      });

      $userFields.prepend(templates.sizeFitTemplate($sizeFitFieldName, sizeFitValue));

      const dateValue = $this.find('.yotpo-header-element.yotpo-header-actions .yotpo-review-date').text();

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
