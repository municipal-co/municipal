import $ from 'jquery'; // eslint-disable-line no-unused-vars
import Swiper from 'swiper';
import BaseSection from './base';
import VideoPlayer from '../ui/videoPlayer';

const selectors = {
  videoPlayer: '[data-video-player]',
  videoModal: '[data-video-modal]',
  slideshow: '.swiper-container',
  slide: '.swiper-slide'
};

export default class ProductStyleTips extends BaseSection {
  constructor(container) {
    super(container, 'style-tips');

    this.$container = $(container);
    this.background = this.$container.data('background-color');
    this.$slideshow = $(selectors.slideshow, this.$container);
    this.$slides = $(selectors.slide, this.$container);
    this.$videoPlayer = $(selectors.videoPlayer, this.$container);

    this.observerProperties = {
      root: null,
      threshold: 0.4
    }

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
        const newPlayer = videoPlayers.push(player);
      });
    }

    this.videoPlayers = videoPlayers;
    this.IntersectionObserver = new IntersectionObserver(this.observerCallback.bind(this), this.observerProperties);
    this.IntersectionObserver.observe(this.$container.get(0));

    if (this.$slides.length > 1) {
      this.swiper = new Swiper(this.$slideshow, swiperOptions);
      $('.style-tips-inner-container', this.$container).on('mouseenter', this.onSlideshowEnter.bind(this));
      $('.style-tips-inner-container', this.$container).on('mouseleave', this.onSlideshowLeave.bind(this));
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
}
