import $ from 'jquery';
import BaseSection from './base';
import VideoPlayer from '../ui/videoPlayer';

const selectors = {
  videoPlayer: '[data-video-player]',
  videoModal: '[data-video-modal]',
};

export default class VideoSection extends BaseSection {
  constructor(container) {
    super(container, 'video');
    this.$container = $(container);
    this.background = this.$container.data('background-color');
    this.observerProperties = {
      root: null,
      threshold: 0.4
    }

    this.IntersectionObserver = new IntersectionObserver(this.observerCallback.bind(this), this.observerProperties);

    this.IntersectionObserver.observe(this.$container.get(0));

    if ($(selectors.videoPlayer).length) {
      this.player = new VideoPlayer($(selectors.videoPlayer, this.$container));
    }

    $(selectors.videoModal, this.$container).on('show.bs.modal', this.playVideo.bind(this));
    $(selectors.videoModal, this.$container).on('hide.bs.modal', this.stopVideo.bind(this));
  }

  observerCallback(entries, observer) {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0.4 && this.background !== '') {
        $('body').css('background-color', this.background);
      }
    })
  }

  playVideo(e) {
    this.player.play(); 
  }

  stopVideo(e) {
    this.player.pause();
  }
}
