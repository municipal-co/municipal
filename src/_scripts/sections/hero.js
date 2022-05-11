import $ from 'jquery';
import BaseSection from './base';

const selectors = {
  backgroundVideo: '[data-background-video]',
  mp4Video: '[data-mp4-video]',
  webmVideo: '[data-webm-video]',

}

const classes = {
  playing: 'is-playing'
}

const state = {
  playing: false,
  isMobile: false,
}

export default class Hero extends BaseSection{
  constructor(container) {
    super(container, 'hero');

    this.$backgroundVideo = $(selectors.backgroundVideo, this.$conatiner);
    this.$mp4Video = $(selectors.mp4Video, this.$container);
    this.$webmVideo = $(selectors.webmVideo, this.$container);

    state.desktop_mp4 = this.$backgroundVideo.data('desktop-video-mp4');
    state.desktop_webm = this.$backgroundVideo.data('desktop-video-webm');
    state.mobile_mp4 = this.$backgroundVideo.data('mobile-video-mp4');
    state.mobile_webm = this.$backgroundVideo.data('mobile-video-webm');

    this.$backgroundVideo.on('play', this.onPlayVideo.bind(this));
    this.$backgroundVideo.on('pause', this.onPauseVideo.bind(this));
    this.matchMedia = window.matchMedia('(max-width: 992px)');

    this.matchMedia.addEventListener('change', this.onBreakpointChange.bind(this));

    this.onBreakpointChange(this.matchMedia);
  }

  onPlayVideo() {
    state.playing = true;
  }

  onPauseVideo() {
    state.playing = false;
  }

  onBreakpointChange(evt) {
    if(evt.matches) {
      state.isMobile = true;
      this.$mp4Video.prop('src', state.mobile_mp4);
      this.$webmVideo.prop('src', state.mobile_webm);
      this.$backgroundVideo.get(0).load();
      this.$backgroundVideo.get(0).play();
     } else {
      state.isMobile = false;
      this.$mp4Video.prop('src', state.desktop_mp4);
      this.$webmVideo.prop('src', state.desktop_webm);
      this.$backgroundVideo.get(0).load();
      this.$backgroundVideo.get(0).play();
     }
  }
}