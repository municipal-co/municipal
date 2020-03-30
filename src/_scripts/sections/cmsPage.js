import BaseSection from './base';
import VideoPlayer from '../ui/videoPlayer';

const selectors = {
  videoPlayer: '[data-video-player]'
};

export default class CMSPageSection extends BaseSection {
  constructor(container) {
    super(container, 'cmsPage');

    // Props
    this.videoPlayers = [];

    // Video Players
    this.$container.find(selectors.videoPlayer).each((i, el) => {
      this.videoPlayers.push(new VideoPlayer(el));
    });
  }
}
