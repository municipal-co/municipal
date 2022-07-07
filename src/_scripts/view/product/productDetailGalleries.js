import Swiper from 'swiper';
import BaseSection from '../../sections/base';

const selectors = {
  productGallery: '[data-product-gallery-slideshow]',
  gallerySlide: '[data-slide]'
};

const classes = {
  gallerySlide: 'swiper-slide',
};

export default class productGallery extends BaseSection {
  constructor(container) {
    super(container, 'productGallery');
    this.$container = document.querySelector(selectors.productGallery)
    this.$slides = this.$container.querySelectorAll(selectors.gallerySlide);
    this.currentColor = '';
    this.gallerySettings = {
      slidesToShow: 1,
      autoplay: false,
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
      effect: 'fade'
    }

    this.initGallery();
  }

  initGallery() {
    this.slider = new Swiper(this.$container, this.gallerySettings);
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

  destroy() {
    this.slider.destroy();
  }
}
