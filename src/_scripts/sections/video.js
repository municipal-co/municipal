import $ from 'jquery';
import BaseSection from './base';
import VideoPlayer from '../ui/videoPlayer';

const selectors = {
  videoPlayer: '[data-video-player]',
  videoCover: '[data-video-player-cover]',
  videoModal: '[data-video-modal]',
  videoPlay: '[data-video-play]'
};

export default class VideoSection extends BaseSection {
  constructor(container) {
    super(container, 'video');
    this.$container = $(container);
    this.$videoCover = $(selectors.videoCover, this.$container);

    if ($(selectors.videoPlayer).length) {
      this.player = new VideoPlayer($(selectors.videoPlayer, this.$container));
    }

    $(selectors.videoModal, this.$container).on('show.bs.modal', this.playVideo.bind(this));
    $(selectors.videoModal, this.$container).on('hide.bs.modal', this.stopVideo.bind(this));

    this.$videoCover.on('mouseenter', this.onVideoEnter.bind(this));
    this.$videoCover.on('mouseleave', this.onVideoLeave.bind(this));
  }

  playVideo(e) {
    this.player.play();
  }

  stopVideo(e) {
    this.player.pause();
  }

  onVideoEnter(e) {
    e.preventDefault();
    const screenWidth = $(window).width();
    let x;
    let y;

    if (screenWidth > 991) {
      this.$videoCover.mousemove(function(event) {
        const offset = $(this).offset();
        const buttonWidth = $(selectors.videoPlay, this.$videoCover).width();
        const buttonOffset = buttonWidth / 2;

        x = event.pageX - offset.left - buttonOffset;
        y = event.pageY - offset.top - buttonOffset;

        $(selectors.videoPlay, this.$videoCover).css({left: x, top: y, transform: 'none'});
      });
    }
  }

  onVideoLeave(e) {
    e.preventDefault();
    $(selectors.videoPlay, this.$videoCover).removeAttr('style');
  }
}
