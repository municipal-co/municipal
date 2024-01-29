import $ from 'jquery';
import BaseSection from './base';

const selectors = {
  backgroundVideo: '[data-background-video]',
  mp4Video: '[data-mp4-video]',
  webmVideo: '[data-webm-video]',
  mktDrawerTrigger: '[data-mkt-drawer-trigger]',
}

export default class Hero extends BaseSection{
  constructor(container) {
    super(container, 'hero');

    this.$backgroundVideo = $(selectors.backgroundVideo, this.$container);
    this.$mp4Video = $(selectors.mp4Video, this.$container);
    this.$webmVideo = $(selectors.webmVideo, this.$container);
    this.$mktDrawerTrigger = $(selectors.mktDrawerTrigger, this.$container);

    this.state = {
      playing: false,
      isMobile: false,
      desktop_mp4: this.$backgroundVideo.data('desktop-video-mp4'),
      desktop_webm: this.$backgroundVideo.data('desktop-video-webm'),
      mobile_mp4: this.$backgroundVideo.data('mobile-video-mp4'),
      mobile_webm: this.$backgroundVideo.data('mobile-video-webm'),
    }

    if(this.$backgroundVideo.length) {
      this.$backgroundVideo.on('play', this.onPlayVideo.bind(this));
      this.$backgroundVideo.on('pause', this.onPauseVideo.bind(this));
      this.$backgroundVideo.on('canplay', this.startVideo.bind(this));
      this.matchMedia = window.matchMedia('(max-width: 992px)');

      this.matchMedia.addEventListener('change', this.onBreakpointChange.bind(this));

      this.onBreakpointChange(this.matchMedia);
    }

    this.$mktDrawerTrigger.on('click', this.toggleMktDrawer.bind(this));
  }

  toggleMktDrawer() {
    const drawerData = {
      productName: this.$mktDrawerTrigger.data('product'),
      image: this.$mktDrawerTrigger.data('image'),
    }

    const evt = new CustomEvent('drawerOpen', { detail: {
      type: 'marketing-drawer',
      ...drawerData
    }})

    document.dispatchEvent(evt);
  }

  onPlayVideo() {
    this.state.playing = true;
  }

  onPauseVideo() {
    this.state.playing = false;
  }

  onBreakpointChange(evt) {
    if(evt.matches) {
      this.state.isMobile = true;
      this.$mp4Video.prop('src', this.state.mobile_mp4);
      this.$webmVideo.prop('src', this.state.mobile_webm);
      this.$backgroundVideo.get(0).load();
     } else {
      this.state.isMobile = false;
      this.$mp4Video.prop('src', this.state.desktop_mp4);
      this.$webmVideo.prop('src', this.state.desktop_webm);
      this.$backgroundVideo.get(0).load();
     }
  }

  startVideo(evt) {
    this.$backgroundVideo.get(0).play();
  }
}