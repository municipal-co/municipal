import $ from 'jquery';
import BaseSection from './base';
import VideoPlayer from '../ui/videoPlayer';

const selectors = {
  videoPlayer: '[data-video-player]'
};

export default class VideoSection extends BaseSection {
  constructor(container) {
    super(container, 'video');

    this.player = new VideoPlayer($(selectors.videoPlayer, this.$container));
  }
}
