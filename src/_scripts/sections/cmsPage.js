import $ from 'jquery';
import BaseSection from './base';
import VideoPlayer from '../ui/videoPlayer';

const selectors = {
  videoPlayer: '[data-video-player]',
  cmsBlock: '[data-cms-block]'
};

export default class CMSPageSection extends BaseSection {
  constructor(container) {
    super(container, 'cmsPage');

    this.$container = $(container);
    this.cmsBlocks = $(selectors.cmsBlock, this.$container);

    // Props
    this.videoPlayers = [];

    // Video Players
    this.$container.find(selectors.videoPlayer).each((i, el) => {
      this.videoPlayers.push(new VideoPlayer(el));
    });
  }
}
