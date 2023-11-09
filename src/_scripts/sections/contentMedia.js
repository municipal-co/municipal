import $ from 'jquery';
import BaseSection from './base';

const selectors = {
  videoWrapper: '[data-video-wrapper]',
  backgroundVideo: '[data-background-video]',
  mp4Video: '[data-mp4-video]',
  webmVideo: '[data-webm-video]',
  playBtn: '[data-video-play-button]',
  pauseBtn: '[data-video-pause-button]',
  image: '[data-video-image]',
};

export default class contentMedia extends BaseSection {
  constructor(container) {
    super(container, 'contentMedia');

    this.$videoWrapper = $(selectors.videoWrapper, this.$container);
    this.$backgroundVideo = $(selectors.backgroundVideo, this.$container);
    this.$mp4Video = $(selectors.mp4Video, this.$container);
    this.$webmVideo = $(selectors.webmVideo, this.$container);
    this.$playBtn = $(selectors.playBtn, this.$container);
    this.$pauseBtn = $(selectors.pauseBtn, this.$container);
    this.$image = $(selectors.image, this.$container);

    if (this.$backgroundVideo.length) {
      this.state = {
        playing: false,
        autoplay: this.$backgroundVideo[0].hasAttribute('data-autoplay-video'),
        desktop_mp4: this.$backgroundVideo.data('desktop-video-mp4'),
        desktop_webm: this.$backgroundVideo.data('desktop-video-webm'),
      };

      this.$backgroundVideo.on('play', this.onPlayVideo.bind(this));
      this.$backgroundVideo.on('pause', this.onPauseVideo.bind(this));
      this.$playBtn.on('click', this.onBtnClickPlay.bind(this));
      this.$pauseBtn.on('click', this.onBtnClickPause.bind(this));

      if (this.state.autoplay) {
        this.$playBtn.trigger('click');
      }
    }
  }

  onPlayVideo() {
    this.state.playing = true;
  }

  onPauseVideo() {
    this.state.playing = false;
  }

  onBtnClickPlay() {
    this.startVideo();
    this.$image.removeClass('is-cover');
  }

  onBtnClickPause() {
    this.pauseVideo();
  }

  startVideo(evt) {
    this.$backgroundVideo.get(0).play();
    if (this.state.playing === false) {
      this.toggleClass();
    }
  }

  pauseVideo(evt) {
    this.$backgroundVideo.get(0).pause();
    if (this.state.playing === true) {
      this.toggleClass();
    }
  }

  toggleClass() {
    this.$videoWrapper.toggleClass('is-paused');
  }
}
