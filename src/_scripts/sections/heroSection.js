import $ from 'jquery'; // eslint-disable-line no-unused-vars
import BaseSection from './base';
import VideoPlayer from '../ui/videoPlayer';

const selectors = {
  videoPlayer: '[data-video-player]'
};

export default class HeroSection extends BaseSection {
  constructor(container) {
    super(container, 'hero');

    this.$container = $(container);

    this.background = this.$container.data('background-color');

    if ($(selectors.videoPlayer).length) {
      this.player = new VideoPlayer($(selectors.videoPlayer, this.$container));
    }

    this.observerProperties = {
      root: null,
      threshold: 0.4
    }

    this.IntersectionObserver = new IntersectionObserver(this.observerCallback.bind(this), this.observerProperties);

    this.IntersectionObserver.observe(this.$container.get(0));

  }

  observerCallback(entries, observer) {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0.4 && this.background !== '') {
        $('body').css('background-color', this.background);
      }
    })
  }
}
