import $ from 'jquery'; // eslint-disable-line no-unused-vars
import BaseSection from './base';
import VideoPlayer from '../ui/videoPlayer';

const selectors = {
  videoPlayer: '[data-video-player]',
  videoCover: '[data-video-player-cover]',
  videoPlay: '[data-video-play]'
};

export default class ProductOverview extends BaseSection {
  constructor(container) {
    super(container, 'product-overview');

    this.$container = $(container);
    this.$videoCover = $(selectors.videoCover, this.$container);
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

    this.$videoCover.on('mouseenter', this.onVideoEnter.bind(this));
    this.$videoCover.on('mouseleave', this.onVideoLeave.bind(this));
  }

  observerCallback(entries, observer) {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0.4 && this.background !== '') {
        $('body').css('background-color', this.background);
        const event = $.Event('updateCurrentModule', { selector: '#' + this.$container.attr('id') });

        $('body').trigger(event);
      }
    })
  }

  onVideoEnter(e) {
    e.preventDefault();
    const screenWidth = $(window).width();
    let x, y;

    if (screenWidth > 991) {
      this.$videoCover.mousemove(function(event) {
        const offset = $(this).offset();
        const buttonWidth = $(selectors.videoPlay, this.$videoCover).width();
        const buttonOffset = buttonWidth / 2;

        x = event.pageX - offset.left - buttonOffset;
        y = event.pageY - offset.top - buttonOffset;

        $(selectors.videoPlay, this.$videoCover).css({left: x, top: y});
      });
    }
  }

  onVideoLeave(e) {
    e.preventDefault();
    $(selectors.videoPlay, this.$videoCover).removeAttr("style");
  }
}