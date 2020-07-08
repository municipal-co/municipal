import $ from 'jquery'; // eslint-disable-line no-unused-vars
import BaseSection from './base';

export default class YotpoReviews extends BaseSection {
  constructor(container) {
    super(container, 'yotpo-reviews');

    this.$container = $(container);
    this.observerProperties = {
      root: null,
      rootMargin: '0% 0% -20% 0%',
      threshold: 0.1
    };

    /**
     * Yotpo Reviews
     * Format all Yotpo Baseline Reviews as stars + review count, ex: '***** (3)'
     * as soon as Yotpo's loaded.  Set a yotpo 'ready' handler to reformat them
     * each time the widgets are reloaded.
     */
    const limit = 20; // if yotpo hasn't loaded after 20 checks, bail.
    let count = 0;
    const yotpoReadyCallback = () => {
      this.formatSizingMessages();
    };
    const yotpoCheck = setInterval(() => {
      if (typeof yotpo !== 'undefined') {
        if (yotpo.getState() === 'ready') {
          yotpoReadyCallback();
        }
        // Yotpo emits the ready event anytime yotpo.refreshWidgets()
        // is called, so set this up to re-execute each time going forward
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

    // $(window).on('load', this.formatSizingMessages.bind(this));

    this.IntersectionObserver = new IntersectionObserver(this.observerCallback.bind(this), this.observerProperties);
    this.IntersectionObserver.observe(this.$container.get(0));
  }

  formatSizingMessages() {
    const $yotpoWrapper = this.$container;

    const $yotpoReviewsFieldName = $yotpoWrapper.find('.yotpo-bottomline-box-2 .yotpo-product-related-field-name').text();

    const $yotpoSizesLabels = $yotpoWrapper.find('.yotpo-size-field-titles label');

    const labelValues = [];

    $.each($yotpoSizesLabels, function () {
      const value = $(this).text();
      labelValues.push(value);
    });
    labelValues.splice(1, 0, '');
    labelValues.splice(3, 0, '');

    const $yotpoReviewsContainer = $yotpoWrapper.find('.yotpo-reviews');
    const $yotpoReviews = $yotpoReviewsContainer.find('.yotpo-review').not('.yotpo-hidden');

    $.each($yotpoReviews, function () {
      const $this = $(this);

      const $yotpoReviewsColumn = $this.find('.yotpo-product-related-fields-column:first-child');
      const $yotpoReviewsBars = $yotpoReviewsColumn.find('.yotpo-size-bars').first();
      const $yotpoSingleBar = $yotpoReviewsBars.find('.yotpo-product-related-field-score-bar');

      let labelText = '';

      $.each($yotpoSingleBar, function (barIndex) {
        if (!$(this).hasClass('yotpo-size-bar-empty')) {
          labelText = labelValues[barIndex];
        }
      });

      const $firstHeaderElement = $this.find('.yotpo-header-element').not('.yotpo-icon-profile').first();
      const $userFields = $firstHeaderElement.find('.yotpo-user-related-fields');

      $userFields.prepend('<div class="yotpo-user-field" data-type="SingleChoice"><span class="yotpo-user-field-description text-s">' + $yotpoReviewsFieldName + '</span><span class="yotpo-user-field-answer text-s">' + labelText + '</span></div>');

      const $dateValue = $this.find('.yotpo-header-element.yotpo-header-actions .yotpo-review-date').text();

      $userFields.prepend('<div class="yotpo-user-field" data-type="SingleChoice"><span class="yotpo-user-field-description text-s">Date:</span><span class="yotpo-user-field-answer text-s">' + $dateValue + '</span></div>');

      const $userNameValue = $firstHeaderElement.find('.yotpo-user-name').text();

      $userFields.prepend('<div><span class="y-label yotpo-user-name yotpo-font-bold pull-left" aria-level="3">' + $userNameValue + '</span></div>');

      const $verifiedLabel = $firstHeaderElement.find('.label-with-tooltip');

      if ($verifiedLabel.length) {
        $userFields.prepend('<div class="label-with-tooltip pull-left" aria-level="3"><span class="y-label yotpo-user-title yotpo-action-hover" data-type="toggleFade" data-target="yotpo-tool-tip" aria-describedby="179043713">Verified Reviewer</span></div>');
      }


      const $lastUserField = $userFields.find('.yotpo-user-field').last();
      const $recommendDescription = $lastUserField.find('.yotpo-user-field-description');
      const $recommendAnswer = $lastUserField.find('.yotpo-user-field-answer');

      $recommendDescription.text($recommendDescription.text().replace(' to a Friend', ''));

      if ($recommendAnswer.text() === 'Yes') {
        $recommendAnswer.text($recommendAnswer.text().replace('Yes', 'Yes👍'));
      } else {
        $recommendAnswer.text($recommendAnswer.text().replace('No', 'No❌'));
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
