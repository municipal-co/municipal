import $ from 'jquery';
import Swiper from 'swiper';
import BaseSection from '../../sections/base';

const selectors = {
  productGallery: '[data-product-gallery-slideshow]',
  gallerySlide: '[data-slide]'
};

const classes = {
  gallerySlide: 'swiper-slide',
  zoomedIn: 'is-zoomed',
  zoomReady: 'is-zoomable'
};

export default class productGallery extends BaseSection {
  constructor(container) {
    super(container, 'productGallery');
    const self = this;
    this.$container = document.querySelector(selectors.productGallery)
    this.$slides = this.$container.querySelectorAll(selectors.gallerySlide);
    this.currentColor = '';
    this.gallerySettings = {
      slidesToShow: 1,
      autoplay: false,
      zoom: {
        maxRatio: 5,
        minRatio: 1,
        toggle: true,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      lazy: {
        loadPrevNext: true,
        loadPrevNextAmount: 2
      },
      fadeEffect: {
        crossFade: true,
      },
      loop: true,
      threshold: 40,
      effect: 'fade',
      init: false,
    }

    this.slider = new Swiper(this.$container, this.gallerySettings);
    // this.slider.on('slideChange', this.onSlideChange.bind(this));
    this.slider.init();
  }

  onVariantChange(variant) {
    let colorIndex;
    variant.options.forEach((option, index) => {
      if(option === 'color' || option === 'Color') {
        colorIndex = `option${index+1}`;
      }
    });

    if(colorIndex !== undefined) {
      if(this.currentColor !== variant[colorIndex]) {
        this.currentColor = variant[colorIndex];
        this.slider.destroy();
        const colorName = variant[colorIndex];

        this.$slides.forEach((slide, index) => {
          slide.classList.remove(classes.gallerySlide);
          if(slide.dataset.colorIdentifier.toLowerCase() === colorName.toLowerCase()) {
            slide.classList.add(classes.gallerySlide);
          }
        })
      }

      // Update variant images here
      this.slider = new Swiper(this.$container, this.gallerySettings);
    }
  }

  onSlideChange() {
    console.log(this.slider.slides[this.slider.activeIndex]);

    this.initZoom(this.slider.slides[this.slider.activeIndex]);
  }

  initZoom(slide) {
    $(slide).zoom({
      url: $(slide).data('image-url'),
      on: 'click',
      target: '.product-gallery__zoom-container',
      touch: false,
      escToClose: true,
      magnify: 1,
      duration: 300,
      callback: () => {
        slide.classList.add(classes.zoomReady);

      },
      onZoomIn: () => {
        slide.classList.add(classes.zoomedIn);
        document.querySelector('[data-zoom-container]').classList.add(classes.zoomedIn);
      },
      onZoomOut: () => {
        slide.classList.remove(classes.zoomedIn);
        document.querySelector('[data-zoom-container]').classList.remove(classes.zoomedIn);
      }
    })
  }

  destroy() {
    this.slider.destroy();
  }
}
