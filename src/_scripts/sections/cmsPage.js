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

    this.observerProperties = {
      root: null,
      threshold: 0.5
    }

    // Props
    this.videoPlayers = [];

    // Video Players
    this.$container.find(selectors.videoPlayer).each((i, el) => {
      this.videoPlayers.push(new VideoPlayer(el));
    });

    self = this;

    this.cmsBlocks.each(function() {
      self.IntersectionObserver = new IntersectionObserver(self.observerCallback.bind(self), self.observerProperties);
      self.IntersectionObserver.observe(this);
    });
  }

  observerCallback(entries, observer) {
    entries.forEach((entry) => {
      var entryBackground = $(entry.target).data('background-color');
      
      if (entry.intersectionRatio > 0.5 && entryBackground !== '') {
        $('body').css('background-color', entryBackground);
      }
    })
  }
}
