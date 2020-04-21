import $ from 'jquery'; // eslint-disable-line no-unused-vars
import BaseSection from './base';
import VideoPlayer from '../ui/videoPlayer';

const selectors = {
  videoPlayer: '[data-video-player]',
};

export default class CollectionBanner extends BaseSection {
  constructor(container) {
    super(container, 'collection-banner');

    this.$container = $(container);
    this.$videoCover = $(selectors.videoCover, this.$container);
    this.background = this.$container.data('background-color');

    if ($(selectors.videoPlayer).length) {
      this.player = new VideoPlayer($(selectors.videoPlayer, this.$container));
    }
  }
}
