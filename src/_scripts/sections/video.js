import $ from 'jquery';
import BaseSection from './base';
import VideoPlayer from '../ui/videoPlayer';

const selectors = {
  videoPlayer: '[data-video-player]',
  videoCover: '[data-video-player-cover]',
  videoModal: '[data-video-modal]',
  videoModalInline: '[data-video-modal-inline]',
  videoPlay: '[data-video-play]'
};

export default class VideoSection extends BaseSection {
  constructor(container) {
    super(container, 'video');
    this.$container = $(container);
    this.$videoCover = $(selectors.videoCover, this.$container);
    this.videoTarget = this.$videoCover.data('target');
    this.$modal = $(this.videoTarget);
    this.modalInline = $(selectors.videoModalInline).length ? true : false;


    if ($(selectors.videoPlayer).length) {
      this.player = new VideoPlayer($(selectors.videoPlayer, this.$modal));
    }

    this.$modal.on('show.bs.modal', this.playVideo.bind(this));

    if ( this.modalInline ) {
      this.$modal.on('shown.bs.modal', function() {
        $('body').removeClass('modal-open');
      });
    }
    this.$modal.on('hide.bs.modal', this.stopVideo.bind(this));

    this.$videoCover.on('mouseenter', this.onVideoEnter.bind(this));
    this.$videoCover.on('click', this.onVideoClick.bind(this));
  }

  onVideoClick(e) {
    e.preventDefault();
    this.$modal.modal({
      show: true,
      backdrop: this.modalInline ? false : true
    });
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

    if (screenWidth > 991.98) {

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
}
