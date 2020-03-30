import $ from 'jquery';
import VimeoPlayer from '@vimeo/player';

/* eslint-disable */
/**
 * Video Player Script
 * -----------------------------------------------------------------------------
 *
 * Creates a Video Player player out of basic markup
 * Requires some basic styling to make things work correctly - see components/video-player.scss
 *
 * Mark up looks like...
 *
 * <div id="video-player-{{ yt_video_id }}" class="video-player" data-video-player data-video-id="{{ yt_video_id }}" data-video-type="vimeo / youtube" data-background="{{ true / false }}" data-embed-color="{{ hex_color }}">
 *   <div class="video-player__cover" data-video-player-cover>
 *     <div class="video-player__cover-still" style="background-image: url(...);"></div>
 *     <span class="video-player__cover-play">{% include 'icon-play-button' %}</span>
 *   </div>
 *   <div class="video-player__embed" data-video-player-embed></div>
 * </div>
 *
 */
/* eslint-enable */

const selectors = {
  videoPlayer: '[data-video-player]',
  videoPlayerEmbed: '[data-video-player-embed]',
  videoPlayerCover: '[data-video-player-cover]'
};

const classes = {
  state: {
    playing: 'video-player--playing',
    ended:   'video-player--ended',
    paused:  'video-player--paused',
    buffering: 'video-player--buffering'
  }
};

const VIDEO_TYPES = {
  VIMEO:   'vimeo',
  YOUTUBE: 'youtube'
};

const dataKey = 'video-player-instance';

export default class VideoPlayer {
  /**
   * VideoPlayer constructor
   *
   * @param {HTMLElement | $} el - Element containing required markup.  All settings are passed as data attributes on this element
   */   
  constructor(el) {
    this.name = 'videoPlayer';
    this.namespace = `.${this.name}`;

    this.$el = $(el);

    if (!this.$el.is(selectors.videoPlayer)) {
      console.warn(`[${this.name}] - Element matching ${selectors.videoPlayer} required to initialize`);
      return;
    }

    this.player     = null;
    this.state      = null;
    this.type       = this.$el.data('video-type');
    this.id         = this.$el.data('video-id');
    this.background = this.$el.data('background');
    this.embedColor = this.$el.data('embed-color') || '000';

    if (!this.id || !(this.type === VIDEO_TYPES.VIMEO || this.type === VIDEO_TYPES.YOUTUBE)) {
      console.warn(`[${this.name}] - Video ID and valid video type required to initialize`);
      return;
    }

    this.$embed = this.$el.find(selectors.videoPlayerEmbed);
    this.$cover = this.$el.find(selectors.videoPlayerCover);

    // These bind functions create a player from their respective JS libraries
    // and add a click handlers on the cover
    if (this.type === VIDEO_TYPES.VIMEO) {
      this.bindVimeoPlayer();
    }
    else if (this.type === VIDEO_TYPES.YOUTUBE) {
      this.bindYouTubePlayer();
    }
  }

  bindVimeoPlayer() {
    const opts = {
      id: this.id,
      color: this.embedColor.replace('#', '')
    };

    opts.background = this.background || false;
    opts.muted      = this.background;
    opts.autoplay   = this.background;

    this.player = new VimeoPlayer(this.$embed, opts);

    this.player.on('ended', this.onEnded.bind(this));
    this.player.on('play',  this.onPlay.bind(this));
    this.player.on('pause', this.onPaused.bind(this));
    this.player.on('bufferstart', this.onBuffering.bind(this));

    if (this.background && this.$cover.length) {
      this.$cover.remove();
      this.$cover = null;
    }
    else {
      this.$cover.on('click', this.onCoverClick.bind(this));
    }
  }

  bindYouTubePlayer() {
    function createPlayer() {
      const uniqID = `${this.$el.attr('id')}-player`;
      this.$embed.attr({
        sandbox: 'allow-same-origin allow-scripts allow-presentation',
        id: uniqID,
        frameborder: 0
      });

      this.player = new window.YT.Player(uniqID, {
        videoId: this.id,
        playerVars: {
          rel: 0,
          autohide: 1,
          controls: 2,
          playsinline: 1,
          modestbranding: 1,
          wmode: 'transparent',
        },
        events: {
          onReady: (e) => {
            this.$cover.on('click', this.onCoverClick.bind(this));
          },
          onStateChange: (e) => {
            switch (e.data) {
              case window.YT.PlayerState.PLAYING:
                this.onPlay();
                break;
              case window.YT.PlayerState.PAUSED:
                this.onPaused();
                break;
              case window.YT.PlayerState.ENDED:
                this.onEnded();
                break;
              case window.YT.PlayerState.BUFFERING:
                this.onBuffering();
                break;
            }
          }
        }
      });
    }

    const _createPlayer = createPlayer.bind(this);

    if (window.YT === undefined) {
      window.onYouTubeIframeAPIReady = _createPlayer;

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';

      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    else {
      _createPlayer();
    }
  }

  switchToState(state) {
    this.$el.removeClass(classes.state[this.state]);
    this.$el.addClass(classes.state[state]);
    
    this.state = state;
  }

  play() {
    if (this.type === VIDEO_TYPES.YOUTUBE) {
      this.player.playVideo();
    }
    else if (this.type === VIDEO_TYPES.VIMEO) {
      this.player.play().then(this.onPlaying.bind(this));
    }
  }

  pause() {
    if (this.type === VIDEO_TYPES.YOUTUBE) {
      this.player.pauseVideo();
    }
    else if (this.type === VIDEO_TYPES.VIMEO) {
      this.player.pause().then(this.onPaused.bind(this));
    }
  }

  onPlay() {
    this.switchToState('playing');
  }

  onEnded() {
    this.switchToState('ended');
  }

  onPaused() {
    this.switchToState('paused');
  }

  onBuffering() {
    this.switchToState('buffering');
  }

  onCoverClick(e) {
    e.preventDefault();
    this.play();
  }

  static ensure(el) {
    let $el =  $(el);

    if (!$el.is(selectors.videoPlayer)) {
      $el = $el.parents(selectors.videoPlayer);
    }

    let data = $el.data(dataKey);

    if (!data) {
      $el.data(dataKey, (data = new VideoPlayer($el)));
    }

    return data;
  }

  static refresh($container) {
    $(selectors.videoPlayer, $container).each((i, el) => {
      VideoPlayer.ensure(el);
    });
  }

  static getDataKey() {
    return dataKey;
  }
}
