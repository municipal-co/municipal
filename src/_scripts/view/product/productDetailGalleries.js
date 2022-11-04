import $ from 'jquery';
import Swiper from 'swiper';
import BaseSection from '../../sections/base';

const selectors = {
  productGallery: '[data-product-gallery-slideshow]',
  gallerySlide: '[data-slide]',
  zoomToggler: '[data-zoom-toggler]',
  nextArrow: '[data-arrow-next]',
  prevArrow: '[data-arrow-prev]'
};

const classes = {
  gallerySlide: 'swiper-slide',
  zoomedIn: 'is-zoomed',
  zoomReady: 'is-zoomable'
};

export default class productGallery extends BaseSection {
  constructor(container) {
    super(container, 'productGallery');
    this.$container = document.querySelector(selectors.productGallery)
    this.$slides = this.$container.querySelectorAll(selectors.gallerySlide);
    this.$zoomToggler = this.$container.querySelectorAll(selectors.zoomToggler);
    this.$nextArrow = this.$container.closest('.product-gallery').querySelector('[data-arrow-next]');
    this.$prevArrow = this.$container.closest('.product-gallery').querySelector(selectors.prevArrow);

    this.currentColor = '';
    this.gallerySettings = {
      slidesPerView: 1.2,
      autoplay: false,
      watchOverflow: true,
      centeredSlides: true,
      effect: 'slide',
      spaceBetween: 10,
      autoHeight: true,
      zoom: {
        maxRatio: 3,
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
      navigation: {
        nextEl: this.$nextArrow,
        prevEl: this.$prevArrow,
        enabled: true,
      },
      loop: true,
      threshold: 40,
      breakpoints: {
        992: {
          slidesPerView: 1,
        }
      },
      init: false,
    }

    this.slider = new Swiper(this.$container, this.gallerySettings);
    this.slider.on('slideChange', this.onSlideChange.bind(this));
    this.slider.init();

    this.$zoomToggler.forEach((toggler) => {
      toggler.addEventListener('click', this.toggleSliderZoom.bind(this));
    })

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

        if(this.slider && !this.slider.destroyed) {
          this.slider.destroy();
        }

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
      this.slider.init();
    }
  }

  toggleSliderZoom() {
    if(this.slider && !this.slider.destroyed) {
      this.slider.zoom.toggle();
    }
  }

  onSlideChange() {
    if(this.slider.zoom.enabled) {
      this.slider.zoom.out();
    }
  }

  destroy() {
    this.slider.destroy();
  }
}
