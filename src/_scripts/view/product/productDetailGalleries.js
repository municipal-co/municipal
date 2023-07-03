import Swiper, { Navigation, Pagination, Scrollbar, Zoom, Lazy } from 'swiper';
import BaseSection from '../../sections/base';

const selectors = {
  productGallery: '[data-product-gallery-slideshow]',
  gallerySlide: '[data-slide]',
  zoomToggler: '[data-zoom-toggler]',
  nextArrow: '[data-arrow-next]',
  prevArrow: '[data-arrow-prev]',
  productSingleOption: '[data-single-option-selector]',
  discountBadge: '[data-discount-badge]',
};

const classes = {
  gallerySlide: 'swiper-slide',
  zoomedIn: 'is-zoomed',
  zoomReady: 'is-zoomable',
  enableBadge: 'enable-badge',
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
      modules: [Navigation, Pagination, Scrollbar, Zoom, Lazy],
      slidesPerView: 1.2,
      autoplay: false,
      watchOverflow: true,
      centeredSlides: true,
      effect: 'slide',
      spaceBetween: 10,
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

    this.updateDiscountBadge();


    this.$zoomToggler.forEach((toggler) => {
      toggler.addEventListener('click', this.toggleSliderZoom.bind(this));
    })

  }

  updateDiscountBadge() {
    const discountBadges = this.$container.querySelectorAll(selectors.discountBadge);
    if(discountBadges && discountBadges.length) {
      discountBadges.forEach( (badge) => {
        const comparePrice = badge.dataset.variantComparePrice;
        const variantPrice = badge.dataset.variantPrice;
        let badgeThreshold = 'discount-badge--first-threshold';
        const discountValue = 100 - (variantPrice / comparePrice * 100);

        if(discountValue >= 70) {
          badgeThreshold = 'discount-badge--third-threshold';
        } else if(discountValue >= 50) {
          badgeThreshold = 'discount-badge--second-threshold';
        }

        badge.innerHTML = `${discountValue}% <br /> OFF`;
        badge.classList.remove('discount-bage--first-threshold', 'discount-bage--second-threshold', 'discount-bage--third-threshold')
        badge.classList.add(badgeThreshold);
      })
    }
  }

  onVariantChange(variant) {
    let colorIndex;
    let colorName;

    if (variant) {
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

          colorName = variant[colorIndex];
        }
      }
    } else {
      const colorSwatch = document.querySelector('[data-option-name=color]:checked');
      if(colorSwatch) {
        this.currentColor = colorSwatch.dataset.optionValue;
        colorName = colorSwatch.dataset.optionValue;
      }
    }

    if(colorName) {
      this.$slides.forEach((slide, index) => {
        slide.classList.remove(classes.gallerySlide);
        if(slide.dataset.colorIdentifier.toLowerCase() === colorName.toLowerCase()) {
          slide.classList.add(classes.gallerySlide);
        }
      })
      // Update variant images here
      this.slider = new Swiper(this.$container, this.gallerySettings);
      this.slider.init();
      if(this.$discountBadge && this.$discountBadge.length) {
        this.$discountBadge.forEach( badge => {
          this.updateDiscountBadge(badge);
        })
      }
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
