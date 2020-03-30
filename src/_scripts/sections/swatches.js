import $ from 'jquery';
import BaseSection from './base';

const selectors = {
  dotsPreview: '[data-dots-preview]',
  dotsPreviewItem: '[data-dots-preview-item]'
};

const classes = {
  dotsPreviewItemActive: 'is-active'
};

export default class SwatchesSection extends BaseSection {
  constructor(container) {
    super(container, 'swatches');

    this.$dotsPreview = $(selectors.dotsPreview, this.$container);
    this.$dotsPreviewItems = $(selectors.dotsPreviewItem, this.$container);
  }

  onSelect(e) {
    e.detail.load ? this.$dotsPreview.show() : this.$dotsPreview.slideDown(200);
  }

  onDeselect() {
    this.$dotsPreview.slideUp(200);
  }

  onBlockSelect(e) {
    this.$dotsPreviewItems.filter('[data-dots-preview-item="'+e.detail.blockId+'"]').addClass(classes.dotsPreviewItemActive);
  }

  onBlockDeselect(e) {
    this.$dotsPreviewItems.removeClass(classes.dotsPreviewItemActive);
  }
}
