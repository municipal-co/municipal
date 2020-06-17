import $ from 'jquery'; // eslint-disable-line no-unused-vars
import Swiper from 'swiper';
import BaseSection from './base';
import VideoPlayer from '../ui/videoPlayer';

const selectors = {
  videoPlayer: '[data-video-player]',
  videoModal: '[data-video-modal]',
  videoCover: '[data-video-cover]',
  slideshow: '.swiper-container',
  videoPlay: '[data-play-button]',
  slide: '.swiper-slide'
};

export default class ProductStyleTips extends BaseSection {
  constructor(container) {
    super(container, 'style-tips');

    this.$container = $(container);
    this.$slideshow = $(selectors.slideshow, this.$container);
    this.$slides = $(selectors.slide, this.$container);
    this.$videoCover = $(selectors.videoCover, this.$container);
    this.$videoPlayer = $(selectors.videoPlayer, this.$container);

    const swiperOptions = {
      loop: false,
      spaceBetween: 10,
      scrollbar: {
        el: $('.swiper-scrollbar', this.$container),
        draggable: true,
      },
      navigation: {
        nextEl: $('.swiper-button-next', this.$container),
        prevEl: $('.swiper-button-prev', this.$container),
      }
    };

    const videoPlayers = [];
    if (this.$videoPlayer.length) {
      this.$videoPlayer.each(function( index ) {
        const player = new VideoPlayer(this);
        const newPlayer = videoPlayers.push(player); // eslint-disable-line no-unused-vars
      });
    }

    this.videoPlayers = videoPlayers;

    if (this.$slides.length > 1) {
      this.swiper = new Swiper(this.$slideshow, swiperOptions);
      $('.style-tips-inner-container', this.$container).on('mouseenter', this.onSlideshowEnter.bind(this));
      $('.style-tips-inner-container', this.$container).on('mouseleave', this.onSlideshowLeave.bind(this));
    }

    $(selectors.videoModal, this.$container).on('show.bs.modal', this.playVideo.bind(this));
    $(selectors.videoModal, this.$container).on('hide.bs.modal', this.stopVideo.bind(this));


    this.$videoCover.on('mouseenter', this.onVideoEnter.bind(this));
    this.$videoCover.on('mouseleave', this.onVideoLeave.bind(this));
  }

  onSlideshowEnter(e) {
    e.preventDefault();
    $('.swiper-button', this.$container).addClass('visible');
  }

  onSlideshowLeave(e) {
    e.preventDefault();
    $('.swiper-button', this.$container).removeClass('visible');
  }

  playVideo(e) {
    const videoIndex = $(e.currentTarget).data('video-modal');
    this.videoPlayers[videoIndex].play();
  }

  stopVideo(e) {
    const videoIndex = $(e.currentTarget).data('video-modal');
    this.videoPlayers[videoIndex].pause();
  }

  onVideoEnter(e) {
    e.preventDefault();
    const $currentCover = $(e.currentTarget);
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

        $(selectors.videoPlay, $currentCover).css({left: x, top: y, transform: 'none'});
      });
    }
  }

  onVideoLeave(e) {
    e.preventDefault();
    const $currentCover = $(e.currentTarget);

    $(selectors.videoPlay, $currentCover).removeAttr('style');
  }
}
